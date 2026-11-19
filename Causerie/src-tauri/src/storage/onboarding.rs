use tauri::State;
use tauri_plugin_sql::DbInstances;
use crate::CommandError;
use super::database;

#[tauri::command]
pub async fn activate_onboarding_profile(databases: State<'_, DbInstances>, user_id: String) -> Result<(), CommandError> {
    let pool = database::pool(databases.inner()).await?;
    let mut tx = pool.begin_with("BEGIN IMMEDIATE").await.map_err(database::error)?;
    let active: Option<String> = sqlx::query_scalar("SELECT active_user_id FROM app_state WHERE id=1")
        .fetch_optional(&mut *tx).await.map_err(database::error)?;
    if active.as_ref().is_some_and(|id| id != &user_id) {
        return Err(CommandError::app("Another profile is active. Restart setup."));
    }
    sqlx::query("INSERT INTO app_state(id,active_user_id,onboarding_completed_at) VALUES(1,?,NULL) ON CONFLICT(id) DO NOTHING")
        .bind(&user_id).execute(&mut *tx).await.map_err(database::error)?;
    tx.commit().await.map_err(database::error)?;
    Ok(())
}

#[tauri::command]
pub async fn get_onboarding_progress(databases: State<'_, DbInstances>, user_id: String) -> Result<Option<String>, CommandError> {
    let pool = database::pool(databases.inner()).await?;
    sqlx::query_scalar("SELECT state_json FROM onboarding_progress WHERE user_id=?")
        .bind(user_id).fetch_optional(&pool).await.map_err(database::error)
}

#[tauri::command]
pub async fn save_onboarding_progress(databases: State<'_, DbInstances>, user_id: String, state_json: String) -> Result<(), CommandError> {
    if state_json.len() > 262144 || serde_json::from_str::<serde_json::Value>(&state_json).map_or(true, |v| !v.is_object()) {
        return Err(CommandError::app("Invalid tutorial progress."));
    }

    let pool = database::pool(databases.inner()).await?;
    let mut tx = pool.begin_with("BEGIN IMMEDIATE").await.map_err(database::error)?;
    let active: Option<String> = sqlx::query_scalar("SELECT active_user_id FROM app_state WHERE id=1")
        .fetch_optional(&mut *tx).await.map_err(database::error)?;

    if active.as_deref() != Some(&user_id) {
        return Err(CommandError::app("This profile is no longer active."));
    }

    sqlx::query("INSERT INTO onboarding_progress(user_id,state_json) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET state_json=excluded.state_json,updated_at=CURRENT_TIMESTAMP")
        .bind(user_id).bind(state_json).execute(&mut *tx).await.map_err(database::error)?;
    tx.commit().await.map_err(database::error)?;
    Ok(())
}