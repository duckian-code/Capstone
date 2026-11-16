mod engine;
#[cfg(test)]
mod tests;
use crate::{CommandError, storage::database};
use engine::{Answers, Attempt, Seen};
use sqlx::{Sqlite, SqlitePool, Transaction};
use std::collections::BTreeMap;
use tauri::State;
use tauri_plugin_sql::DbInstances;
use tokio::sync::Mutex;

// Serialize assessment operations; no draft is persisted. A failed transaction never
// advances the in-memory attempt. Retries reuse the original block and option order.
#[derive(Default)]
pub struct AssessmentState(Mutex<BTreeMap<String, Attempt>>);
fn now() -> String {
    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}
fn invalid(message: impl Into<String>) -> CommandError {
    CommandError::app(message)
}
async fn active(tx: &mut Transaction<'_, Sqlite>, user: &str) -> Result<(), CommandError> {
    let found: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM app_state WHERE id=1 AND active_user_id=?")
            .bind(user)
            .fetch_one(&mut **tx)
            .await
            .map_err(database::error)?;
    if found != 1 {
        return Err(invalid(
            "This profile is not active. Return to the profile that began the assessment.",
        ));
    }
    Ok(())
}
async fn saved(
    tx: &mut Transaction<'_, Sqlite>,
    user: &str,
    id: &str,
) -> Result<Option<Attempt>, CommandError> {
    let json: Option<String> = sqlx::query_scalar("SELECT record_json FROM proficiency_assessments WHERE id=? AND user_id=? AND language='fr'")
        .bind(id).bind(user).fetch_optional(&mut **tx).await.map_err(database::error)?;
    json.map(|s| {
        serde_json::from_str(&s).map_err(|_| invalid("The stored assessment could not be read."))
    })
    .transpose()
}
async fn seen(tx: &mut Transaction<'_, Sqlite>, user: &str) -> Result<Seen, CommandError> {
    let rows: Vec<(String, String, String)> = sqlx::query_as("SELECT bank_id, question_id, last_seen_at FROM proficiency_question_exposure WHERE user_id=? AND language='fr'")
        .bind(user).fetch_all(&mut **tx).await.map_err(database::error)?;
    Ok(rows.into_iter().map(|(b, q, t)| ((b, q), t)).collect())
}
async fn expose(tx: &mut Transaction<'_, Sqlite>, a: &Attempt) -> Result<(), CommandError> {
    let block = a
        .blocks
        .last()
        .ok_or_else(|| invalid("Missing assessment block."))?;
    for i in &block.items {
        sqlx::query("INSERT INTO proficiency_question_exposure(user_id,language,bank_id,question_id,last_seen_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id,language,bank_id,question_id) DO UPDATE SET last_seen_at=MAX(last_seen_at,excluded.last_seen_at)")
            .bind(&a.user_id).bind(&a.language).bind(&i.bank_id).bind(&i.question.id).bind(&block.shown_at)
            .execute(&mut **tx).await.map_err(database::error)?;
    }
    Ok(())
}
async fn persist(tx: &mut Transaction<'_, Sqlite>, a: &Attempt) -> Result<(), CommandError> {
    if a.status != "completed" || a.completed_at.is_none() || a.results.is_none() {
        return Err(invalid("Assessment is incomplete."));
    }
    let json = serde_json::to_string(a).map_err(|_| invalid("Assessment serialization failed."))?;
    // One immutable record contains evidence, results and all snapshots atomically.
    sqlx::query("INSERT INTO proficiency_assessments(id,user_id,language,status,started_at,completed_at,scoring_policy_version,record_json) VALUES(?,?,?,?,?,?,?,?)")
        .bind(&a.id).bind(&a.user_id).bind(&a.language).bind(&a.status).bind(&a.started_at)
        .bind(&a.completed_at).bind(&a.scoring_policy.version).bind(json)
        .execute(&mut **tx).await.map_err(database::error)?;
    Ok(())
}
fn validate_id(id: &str) -> Result<(), CommandError> {
    if id.len() != 36 || !id.bytes().all(|b| b.is_ascii_hexdigit() || b == b'-') {
        return Err(invalid("Invalid assessment ID."));
    }
    Ok(())
}
async fn start(
    pool: &SqlitePool,
    state: &AssessmentState,
    user: &str,
    id: &str,
) -> Result<serde_json::Value, CommandError> {
    validate_id(id)?;
    let mut sessions = state.0.lock().await;
    let mut tx = pool.begin().await.map_err(database::error)?;
    active(&mut tx, user).await?;
    if let Some(a) = saved(&mut tx, user, id).await? {
        return Ok(engine::public_view(&a));
    }
    if let Some(a) = sessions.get(id) {
        if a.user_id != user {
            return Err(invalid("This attempt belongs to another profile."));
        }
        return Ok(engine::public_view(a));
    }
    if sessions.values().any(|a| a.user_id == user) {
        return Err(invalid(
            "An assessment is already open for this profile. Close it before starting another.",
        ));
    }
    let banks = engine::banks().map_err(invalid)?;
    let mut a = Attempt::new(id.into(), user.into(), now(), &banks).map_err(invalid)?;
    a.next_block(&banks, &seen(&mut tx, user).await?, now())
        .map_err(invalid)?;
    expose(&mut tx, &a).await?;
    tx.commit().await.map_err(database::error)?;
    let view = engine::public_view(&a);
    sessions.insert(id.into(), a);
    Ok(view)
}
async fn submit(
    pool: &SqlitePool,
    state: &AssessmentState,
    user: &str,
    id: &str,
    block_index: usize,
    answers: Answers,
) -> Result<serde_json::Value, CommandError> {
    let mut sessions = state.0.lock().await;
    let mut tx = pool.begin().await.map_err(database::error)?;
    active(&mut tx, user).await?;
    // Also supports retries after a restart, when the commit succeeded but its response was lost.
    if let Some(mut a) = saved(&mut tx, user, id).await? {
        a.submit(block_index, &answers, now()).map_err(invalid)?;
        sessions.remove(id);
        return Ok(engine::public_view(&a));
    }
    let mut a = sessions.get(id).cloned().ok_or_else(|| {
        invalid("This unfinished assessment is no longer available. Start a new test.")
    })?;
    if a.user_id != user {
        return Err(invalid("This attempt belongs to another profile."));
    }
    a.submit(block_index, &answers, now()).map_err(invalid)?;
    if a.status == "completed" {
        persist(&mut tx, &a).await?;
    } else if a.blocks.last().is_some_and(|b| b.submitted_at.is_some()) {
        a.next_block(
            &engine::banks().map_err(invalid)?,
            &seen(&mut tx, user).await?,
            now(),
        )
        .map_err(invalid)?;
        expose(&mut tx, &a).await?;
    }
    tx.commit().await.map_err(database::error)?;
    let view = engine::public_view(&a);
    if a.status == "completed" {
        sessions.remove(id);
    } else {
        sessions.insert(id.into(), a);
    }
    Ok(view)
}
#[tauri::command]
pub async fn start_french_assessment(
    databases: State<'_, DbInstances>,
    state: State<'_, AssessmentState>,
    user_id: String,
    attempt_id: String,
) -> Result<serde_json::Value, CommandError> {
    start(
        &database::pool(databases.inner()).await?,
        &state,
        &user_id,
        &attempt_id,
    )
    .await
}
#[tauri::command]
pub async fn submit_assessment_block(
    databases: State<'_, DbInstances>,
    state: State<'_, AssessmentState>,
    user_id: String,
    attempt_id: String,
    block_index: usize,
    answers: Answers,
) -> Result<serde_json::Value, CommandError> {
    submit(
        &database::pool(databases.inner()).await?,
        &state,
        &user_id,
        &attempt_id,
        block_index,
        answers,
    )
    .await
}
#[tauri::command]
pub async fn cancel_assessment(
    state: State<'_, AssessmentState>,
    user_id: String,
    attempt_id: String,
) -> Result<(), CommandError> {
    // Cancellation is allowed for the original owner after a profile change. It never writes history.
    let mut sessions = state.0.lock().await;
    if sessions
        .get(&attempt_id)
        .is_some_and(|a| a.user_id != user_id)
    {
        return Err(invalid("This attempt belongs to another profile."));
    }
    sessions.remove(&attempt_id);
    Ok(())
}
#[tauri::command]
pub async fn list_assessments(
    databases: State<'_, DbInstances>,
    user_id: String,
    language: String,
) -> Result<Vec<serde_json::Value>, CommandError> {
    let pool = database::pool(databases.inner()).await?;
    let mut tx = pool.begin().await.map_err(database::error)?;
    active(&mut tx, &user_id).await?;
    let rows: Vec<String> = sqlx::query_scalar("SELECT record_json FROM proficiency_assessments WHERE user_id=? AND language=? ORDER BY completed_at DESC,id DESC")
        .bind(user_id).bind(language).fetch_all(&mut *tx).await.map_err(database::error)?;
    // Return original stored results, never rerun today's scorer against old history.
    rows.iter()
        .map(|s| {
            serde_json::from_str(s)
                .map_err(|_| invalid("An assessment history record could not be read."))
        })
        .collect()
}

#[tauri::command]
pub fn french_assessment_info() -> Result<serde_json::Value, CommandError> {
    let config = engine::config();
    let scoring_policy = engine::policy();
    engine::validate(&engine::banks().map_err(invalid)?, &config, &scoring_policy)
        .map_err(invalid)?;
    Ok(serde_json::json!({ "language": "fr", "config": config, "scoringPolicy": scoring_policy }))
}
