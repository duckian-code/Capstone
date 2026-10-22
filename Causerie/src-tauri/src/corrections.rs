use serde::{Deserialize, Serialize};
use sqlx::SqliteConnection;
use tauri::State;
use tauri_plugin_sql::DbInstances;

use crate::{database, CommandError};
use crate::database::error as db_error;

#[derive(Serialize, sqlx::FromRow)]
pub struct MessageCorrection {
    pub id: String,
    pub message_id: String,
    pub original_text: String,
    pub corrected_text: String,
    pub explanation: Option<String>,
    pub start_offset: Option<i64>,
    pub end_offset: Option<i64>,
    pub category: Option<String>,
    pub created_at: String,
    pub goal_id: Option<String>,
    pub origin: String,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct NewCorrection {
    pub message_id: String,
    pub original_text: String,
    pub corrected_text: String,
    pub explanation: Option<String>,
    pub start_offset: Option<i64>,
    pub end_offset: Option<i64>,
    pub category: Option<String>,
    pub goal_id: Option<String>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub(crate) struct SuggestedCorrection {
    pub original_text: String,
    pub corrected_text: String,
    pub explanation: String,
    pub category: String,
    pub goal_id: Option<String>,
}

async fn owned_message(conn: &mut SqliteConnection, message_id: &str) -> Result<String, CommandError> {
    sqlx::query_scalar::<_, String>(
        "SELECT m.content
         FROM messages m
         JOIN threads t ON t.id = m.thread_id
         JOIN app_state s
            ON s.id = 1
            AND s.active_user_id = t.user_id
         WHERE m.id = ? AND m.role = 'user'"
    ).bind(message_id)
        .fetch_optional(&mut *conn)
        .await
        .map_err(db_error)?
        .ok_or_else(|| {
            CommandError::app("This message is unavailable for corrrections.")
        })

}

async fn owned_correction(conn: &mut SqliteConnection, id: &str) -> Result<Option<MessageCorrection>, CommandError> {
    sqlx::query_as::<_, MessageCorrection>(
        "SELECT c.*
         FROM message_corrections c
         JOIN messages m ON m.id = c.message_id
         JOIN threads t ON t.id = m.thread_id
         JOIN app_state s
            ON s.id = 1
            AND s.active_user_id = t.user_id
         WHERE c.id = ?",
    )
        .bind(id)
        .fetch_optional(&mut *conn)
        .await
        .map_err(db_error)
}

// internal repository op. Callers establish message ownership
pub(crate) async fn for_message(conn: &mut SqliteConnection, message_id: &str, teacher_only: bool) -> Result<Vec<MessageCorrection>, CommandError> {
    sqlx::query_as::<_, MessageCorrection>(
        "SELECT *
         FROM message_corrections
         WHERE message_id = ?
            AND (? = 0 OR origin = 'teacher')
         ORDER BY created_at, id",
    )
        .bind(message_id)
        .bind(teacher_only)
        .fetch_all(&mut *conn)
        .await
        .map_err(db_error)
}

// runs inside feedback repo transaction. Never replaces/deletes manual corrections

pub(crate) async fn insert_teacher(conn: &mut SqliteConnection, message_id: &str, corrections: &[SuggestedCorrection]) -> Result<(), CommandError> {
    for correction in corrections {
        sqlx::query(
            "INSERT INTO message_corrections (
                id, message_id, original_text, corrected_text,
                explanation, start_offset, end_offset,
                category, created_at, goal_id, origin
             )
             VALUES (
                lower(hex(randomblob(16))),
                ?, ?, ?, ?, NULL, NULL, ?,
                strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
                ?, 'teacher'
             )",
        )
            .bind(message_id)
            .bind(&correction.original_text)
            .bind(&correction.corrected_text)
            .bind(&correction.explanation)
            .bind(&correction.category)
            .bind(&correction.goal_id)
            .execute(&mut *conn)
            .await
            .map_err(db_error)?;
    }

    Ok(())
}

fn validate_manual(source: &str, input: &NewCorrection) -> Result<(), CommandError> {
    if input.original_text.is_empty()
        || !source.contains(&input.original_text)
        || input.original_text == input.corrected_text
    {
        return Err(CommandError::app("Correction must replcae existing message text."));
    }

    // frontend offsets use JavaScript's UTF-16 indexing
    match (input.start_offset, input.end_offset) {
        (None, None) => {}
        (Some(start), Some(end)) if start >= 0 && end >= start => {
            let units: Vec<u16> = source.encode_utf16().collect();

            let start = usize::try_from(start)
                .map_err(|_| CommandError::app("Invalid correction offsets."))?;
            let end = usize::try_from(end)
                .map_err(|_| CommandError::app("Invalid correction offsets."))?;

            let fragment = units
                .get(start..end)
                .and_then(|slice| String::from_utf16(slice).ok());

            if fragment.as_deref() != Some(input.original_text.as_str()) {
                return Err(CommandError::app(
                    "Correction offsets do not match the original text.",
                ));
            }
        }
        _ => {
            return Err(CommandError::app("Invalid correction offsets."));
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn get_correction(databases: State<'_, DbInstances>, id: String) -> Result<Option<MessageCorrection>, CommandError> {
    let pool = database::pool(databases.inner()).await?;
    let mut connection = pool.acquire().await.map_err(db_error)?;

    owned_correction(&mut connection, &id).await
}

#[tauri::command]
pub async fn list_corrections(databases: State<'_, DbInstances>, message_id: String) -> Result<Vec<MessageCorrection>, CommandError> {
    let pool = database::pool(databases.inner()).await?;
    let mut transaction = pool.begin().await.map_err(db_error)?;

    owned_message(&mut transaction, &message_id).await?;
    let rows = for_message(&mut transaction, &message_id, false).await?;

    transaction.commit().await.map_err(db_error)?;
    Ok(rows)
}

#[tauri::command]
pub async fn create_correction(databases: State<'_, DbInstances>, input: NewCorrection) -> Result<MessageCorrection, CommandError> {
    let pool = database::pool(databases.inner()).await?;
    let mut transaction = pool.begin().await.map_err(db_error)?;

    let source = owned_message(&mut transaction, &input.message_id).await?;
    validate_manual(&source, &input)?;

    let created = sqlx::query_as::<_, MessageCorrection>(
        "INSERT INTO message_corrections (
            id, message_id, original_text, corrected_text,
            explanation, start_offset, end_offset,
            category, created_at, goal_id, origin
         )
         VALUES (
            lower(hex(randomblob(16))),
            ?, ?, ?, ?, ?, ?, ?,
            strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
            ?, 'manual'
         )
         RETURNING *",
    )
        .bind(&input.message_id)
        .bind(&input.original_text)
        .bind(&input.corrected_text)
        .bind(&input.explanation)
        .bind(input.start_offset)
        .bind(input.end_offset)
        .bind(&input.category)
        .bind(&input.goal_id)
        .fetch_one(&mut *transaction)
        .await
        .map_err(db_error)?;

    transaction.commit().await.map_err(db_error)?;
    Ok(created)
}

#[tauri::command]
pub async fn delete_correction(databases: State<'_, DbInstances>, id: String) -> Result<u64, CommandError> {
    let pool = database::pool(databases.inner()).await?;
    let mut transaction = pool.begin().await.map_err(db_error)?;

    let Some(correction) = owned_correction(&mut transaction, &id).await? else {
        transaction.commit().await.map_err(db_error)?;
        return Ok(0);
    };

    if correction.origin == "teacher" {
        return Err(CommandError::app("Teacher corrections belong to a completed review and cannot be deleted individually.",
        ));
    }

    let deleted = sqlx::query("DELETE FROM message_corrections WHERE id = ?")
        .bind(id)
        .execute(&mut *transaction)
        .await
        .map_err(db_error)?
        .rows_affected();

    transaction.commit().await.map_err(db_error)?;
    Ok(deleted)
}