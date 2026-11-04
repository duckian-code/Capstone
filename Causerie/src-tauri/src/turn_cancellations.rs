use std::{
    collections::HashMap,
    future::Future,
    sync::{LazyLock, Mutex},
};

use futures::future::{AbortHandle, Abortable};

use crate::{database, CommandError};

type TurnKey = (String, String);

// some(handle) running request
// none: cancellation arrived before req registered
static REQUESTS: LazyLock<Mutex<HashMap<TurnKey, Option<AbortHandle>>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

pub(crate) async fn run<F, T>(
    thread_id: &str,
    user_message_id: &str,
    future: F,
) -> Result<T, CommandError>
where
    F: Future<Output = Result<T, CommandError>>,
{
    let key = (thread_id.to_owned(), user_message_id.to_owned());
    let (handle, registration) = AbortHandle::new_pair();

    {
        let mut requests = REQUESTS
            .lock()
            .map_err(|_| CommandError::app("Cancellation state is unavailable."))?;

        match requests.get(&key) {
            Some(None) => {
                return Err(CommandError::coded("request_cancelled"));
            }
            Some(Some(_)) => {
                return Err(CommandError::app("This message is already running."));
            }
            None => {
                requests.insert(key.clone(), Some(handle));
            }
        }
    }

    let result = Abortable::new(future, registration).await;

    {
        let mut requests = REQUESTS
            .lock()
            .map_err(|_| CommandError::app("Cancellation state is unavailable."))?;

        // Cancellation markers remain until database cleanup succeeds.
        if matches!(requests.get(&key), Some(Some(_))) {
            requests.remove(&key);
        }
    }

    result.map_err(|_| CommandError::coded("request_cancelled"))?
}

async fn require_active_thread(
    connection: &mut sqlx::SqliteConnection,
    thread_id: &str,
) -> Result<(), CommandError> {
    let available: i64 = sqlx::query_scalar(
        "SELECT EXISTS(
            SELECT 1
            FROM threads t
            JOIN app_state s
              ON s.id = 1 AND s.active_user_id = t.user_id
            WHERE t.id = ? AND t.archived_at IS NULL
        )",
    )
        .bind(thread_id)
        .fetch_one(connection)
        .await
        .map_err(database::error)?;

    if available != 1 {
        return Err(CommandError::app("This thread is unavailable."));
    }

    Ok(())
}

#[tauri::command]
pub async fn cancel_message(databases: tauri::State<'_, tauri_plugin_sql::DbInstances>, thread_id: String, user_message_id: String ) -> Result<(), CommandError> {
    let pool = database::pool(databases.inner()).await?;
    let mut connection = pool.acquire().await.map_err(database::error)?;

    require_active_thread(&mut connection, &thread_id).await?;

    let mut requests = REQUESTS
        .lock()
        .map_err(|_| CommandError::app("Cancellation state is unavailable."))?;

    let key = (thread_id, user_message_id);

    // Store the cancellation even if the stream has not registered yet.
    if let Some(Some(handle)) = requests.insert(key, None) {
        handle.abort();
    }

    Ok(())
}

// The frontend waits for pending message writes before calling this.
#[tauri::command]
pub async fn discard_cancelled_turn(
    databases: tauri::State<'_, tauri_plugin_sql::DbInstances>,
    thread_id: String,
    user_message_id: String,
    assistant_message_id: String,
) -> Result<(), CommandError> {
    if user_message_id == assistant_message_id {
        return Err(CommandError::app("Invalid message IDs."));
    }

    let pool = database::pool(databases.inner()).await?;
    let mut transaction = pool
        .begin_with("BEGIN IMMEDIATE")
        .await
        .map_err(database::error)?;

    require_active_thread(&mut transaction, &thread_id).await?;

    let first_sequence: Option<i64> = sqlx::query_scalar(
        "SELECT MIN(sequence_no)
         FROM messages
         WHERE thread_id = ? AND id IN (?, ?)",
    )
        .bind(&thread_id)
        .bind(&user_message_id)
        .bind(&assistant_message_id)
        .fetch_one(&mut *transaction)
        .await
        .map_err(database::error)?;

    if let Some(first_sequence) = first_sequence {
        let tail: Vec<(String, String)> = sqlx::query_as(
            "SELECT id, role
             FROM messages
             WHERE thread_id = ? AND sequence_no >= ?
             ORDER BY sequence_no",
        )
            .bind(&thread_id)
            .bind(first_sequence)
            .fetch_all(&mut *transaction)
            .await
            .map_err(database::error)?;

        let valid = match tail.as_slice() {
            [(id, role)] => id == &user_message_id && role == "user",
            [(user_id, user_role), (assistant_id, assistant_role)] => {
                user_id == &user_message_id
                    && user_role == "user"
                    && assistant_id == &assistant_message_id
                    && assistant_role == "assistant"
            }
            _ => false,
        };

        if !valid {
            return Err(CommandError::app(
                "Conversation history changed. The cancelled turn could not be removed.",
            ));
        }

        sqlx::query(
            "DELETE FROM messages
             WHERE thread_id = ? AND id IN (?, ?)",
        )
            .bind(&thread_id)
            .bind(&user_message_id)
            .bind(&assistant_message_id)
            .execute(&mut *transaction)
            .await
            .map_err(database::error)?;
    }

    // Repeating cleanup after successful deletion is safe.
    transaction.commit().await.map_err(database::error)?;

    REQUESTS
        .lock()
        .map_err(|_| CommandError::app("Cancellation state is unavailable."))?
        .remove(&(thread_id, user_message_id));

    Ok(())
}