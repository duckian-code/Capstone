use sqlx::SqlitePool;

use crate::CommandError;

pub(crate) enum ConversationRole {
    User,
    Assistant,
}

pub(crate) struct ContextMessage {
    pub role: ConversationRole,
    pub content: String,
}

pub(crate) struct ThreadContext {
    pub thread_id: String,
    pub messages: Vec<ContextMessage>,
}

pub(crate) struct ContextManager;

fn database_error(error: sqlx::Error) -> CommandError {
    log::error!("Conversation context loading failed: {error}");

    CommandError::app("Unable to load conversation history. Please try again.")
}

impl ContextManager {
    pub(crate) async fn for_turn(pool: &SqlitePool, thread_id: &str, user_message_id: &str) -> Result<ThreadContext, CommandError> {
        let mut transaction = pool.begin().await.map_err(database_error)?;

        // resolve ownership from the persisted active profile
        let accessible: i64 = sqlx::query_scalar(
            "SELECT EXISTS(
                SELECT 1
                FROM threads t
                JOIN app_state s
                    ON s.active_user_id = t.user_id
                    AND s.id = 1
                WHERE t.id = ?
                    AND t.archived_at IS NULL
             )"
        )
            .bind(thread_id)
            .fetch_one(&mut *transaction)
            .await
            .map_err(database_error)?;

        if accessible == 0 {
            return Err(CommandError::app("This conversation is unavailable for the active profile."));
        }

        // requested message must be the latest conversational message
        // rejects another thread's message, stale turns, and turns that already have a saved mascot response
        let latest = sqlx::query_as::<_, (String, String, i64, String)>(
            "SELECT id, role, sequence_no, content
             FROM messages
             WHERE thread_id = ?
                AND role IN ('user', 'assistant')
             ORDER BY sequence_no DESC
             LIMIT 1"
        )
            .bind(thread_id)
            .fetch_optional(&mut *transaction)
            .await
            .map_err(database_error)?;

        let Some((message_id, role, sequence_no, content)) = latest else {
            return Err(CommandError::app("Save a message before requesting a reply."));
        };

        if message_id != user_message_id || role != "user" {
            return Err(CommandError::app("The requested message is no longer awaiting a reply."));
        }

        if content.trim().is_empty() {
            return Err(CommandError::app("Please enter a message."));
        }

        // include the saved current message exactly ONCE
        // only ordinary conversation messages participate at this stage
        let rows = sqlx::query_as::<_, (String, String)>(
            "SELECT role, content
             FROM messages
             WHERE thread_id = ?
                AND sequence_no <= ?
                AND role IN ('user', 'assistant')
             ORDER BY sequence_no ASC",
        )
            .bind(thread_id)
            .bind(sequence_no)
            .fetch_all(&mut *transaction)
            .await
            .map_err(database_error)?;

        let mut messages = Vec::with_capacity(rows.len());

        for (role, content) in rows {
            let role = match role.as_str() {
                "user" => ConversationRole::User,
                "assistant" => ConversationRole::Assistant,
                _ => {
                    return Err(CommandError::app("Conversation history contains an unsupported role."));
                }
            };

            messages.push(ContextMessage { role, content });
        }

        // Release the database transaction before starting the network request.
        transaction.commit().await.map_err(database_error)?;

        Ok(ThreadContext { thread_id: thread_id.to_owned(), messages })
    }
}