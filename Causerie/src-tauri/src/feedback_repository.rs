use serde::Serialize;
use sqlx::{SqliteConnection, SqlitePool};

use crate::{
    context::TeacherContext,
    corrections::{self, MessageCorrection, SuggestedCorrection},
    database::error as db_error,
    CommandError,
};

#[derive(Serialize)]
pub struct StoredFeedback {
    pub summary: String,
    pub corrections: Vec<MessageCorrection>,
}

pub(crate) async fn load(connection: &mut SqliteConnection, context: &TeacherContext) -> Result<Option<StoredFeedback>, CommandError> {
    let summary: Option<String> = sqlx::query_scalar(
        "SELECT f.summary
         FROM message_feedback f
         JOIN messages m ON m.id = f.message_id
         WHERE f.message_id = ?
            AND f.source_content = ?
            AND m.content = f.source_content",
    )
        .bind(&context.message_id)
        .bind(&context.content)
        .fetch_optional(&mut *connection)
        .await
        .map_err(db_error)?;

    let Some(summary) = summary else {
        return Ok(None);
    };

    let corrections = corrections::for_message(
        connection,
        &context.message_id,
        true,
    )
        .await?;

    Ok(Some(StoredFeedback {
        summary,
        corrections,
    }))
}

pub(crate) async fn save(
    pool: &SqlitePool,
    context: &TeacherContext,
    instructions: &str,
    summary: &str,
    suggestions: &[SuggestedCorrection]
) -> Result<StoredFeedback, CommandError> {
    let goal_snapshot = serde_json::to_string(&context.goals)
        .map_err(|_| CommandError::app("Unable to serialize feedback context."))?;

    let mut transaction = pool.begin().await.map_err(db_error)?;

    // The first completed review wins. Subsequent requests reuse it
    // The SELECT also checks that the evaluated message still exists unchanged
    let inserted = sqlx::query(
        "INSERT INTO message_feedback (
            message_id, summary, source_content, target_language,
            country, goal_snapshot, instructions
         )
         SELECT m.id, ?, ?, ?, ?, ?, ?
         FROM messages m
         JOIN threads t ON t.id = m.thread_id
         WHERE m.id = ?
            AND m.thread_id = ?
            AND t.user_id = ?
            AND m.role = 'user'
            AND m.content = ?
         ON CONFLICT(message_id) DO NOTHING",
    )
        .bind(summary)
        .bind(&context.content)
        .bind(&context.language)
        .bind(&context.country)
        .bind(goal_snapshot)
        .bind(instructions)
        .bind(&context.message_id)
        .bind(&context.thread_id)
        .bind(&context.user_id)
        .bind(&context.content)
        .execute(&mut *transaction)
        .await
        .map_err(db_error)?
        .rows_affected();

    if inserted == 1 {
        corrections::insert_teacher(
            &mut transaction,
            &context.message_id,
            suggestions,
        )
            .await?;
    }

    let saved = load(&mut transaction, context)
        .await?
        .ok_or_else(|| {
            CommandError::app("The message changed or was deleted before feedback was saved.")
        })?;

    transaction.commit().await.map_err(db_error)?;

    Ok(saved)
}

