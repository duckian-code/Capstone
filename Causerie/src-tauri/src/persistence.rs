use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tauri::State;
use tauri_plugin_sql::DbInstances;

use crate::{database, CommandError};
use crate::database::error as db_error;

// snake_case to match existing frontend DAL models
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub display_name: Option<String>,
    pub pronouns: Option<String>,
    pub native_language: Option<String>,
    pub target_language: Option<String>,
    pub avatar_data_url: Option<String>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct NewUser {
    pub display_name: Option<String>,
    pub pronouns: Option<String>,
    pub native_language: Option<String>,
    pub target_language: Option<String>,
    pub avatar_data_url: Option<String>,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct UserSettings {
    pub user_id: String,
    pub notifications: i64,
    pub theme: String,
    pub font_size: f64,
}

#[derive(Serialize, FromRow)]
pub struct Thread {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub topic: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub archived_at: Option<String>,
}

#[derive(Serialize, FromRow)]
pub struct Message {
    pub id: String,
    pub thread_id: String,
    pub role: String,
    pub content: String,
    pub sequence_no: i64,
    pub openai_response_id: Option<String>,
    pub openai_item_id: Option<String>,
    pub created_at: String,
}

#[derive(Serialize)]
pub struct ThreadHistory {
    pub thread: Thread,
    pub messages: Vec<Message>,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct Sticky {
    pub id: String,
    pub user_id: String,
    pub selected_text: String,
    pub title: String,
    pub user_text: String,
    pub color: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, FromRow)]
pub struct AppState {
    pub id: i64,
    pub active_user_id: String,
    pub onboarding_completed_at: String,
}

// INITIALIZATION
#[tauri::command]
pub async fn initialize_database(databases: State<'_, DbInstances>) -> Result<(), CommandError> {
    // sql plugin preloads the pool and runs migrations during setup
    let pool = database::pool(databases.inner()).await?;

    let foreign_keys: i64 = sqlx::query_scalar("PRAGMA foreign_keys")
        .fetch_one(&pool)
        .await
        .map_err(db_error)?;

    if foreign_keys != 1 {
        return Err(CommandError::app(
            "SQLite foreign-key enforcement is disabled.",
        ));
    }

    Ok(())
}

// USERS
#[tauri::command]
pub async fn get_user(databases: State<'_, DbInstances>, id: String) -> Result<Option<User>, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(id)
        .fetch_optional(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn list_users(databases: State<'_, DbInstances>) -> Result<Vec<User>, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn create_user(databases: State<'_, DbInstances>, fields: NewUser) -> Result<User, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, User>(
        "INSERT INTO users (
            id, display_name, pronouns, native_language,
            target_language, avatar_data_url
         )
         VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?)
         RETURNING *",
    )
        .bind(fields.display_name)
        .bind(fields.pronouns)
        .bind(fields.native_language)
        .bind(fields.target_language)
        .bind(fields.avatar_data_url)
        .fetch_one(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn update_user(databases: State<'_, DbInstances>, user: User) -> Result<u64, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    // preserve update() behavior: avatar changes go through save_user_identity
    let result = sqlx::query(
        "UPDATE users
         SET display_name = ?, pronouns = ?,
             native_language = ?, target_language = ?
         WHERE id = ?",
    )
        .bind(user.display_name)
        .bind(user.pronouns)
        .bind(user.native_language)
        .bind(user.target_language)
        .bind(user.id)
        .execute(&pool)
        .await
        .map_err(db_error)?;

    Ok(result.rows_affected())
}

#[tauri::command]
pub async fn create_user_if_missing(databases: State<'_, DbInstances>, user: User) -> Result<User, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    // acquire write transaction before reading to avoid deferred read-to-write under concurrent init
    let mut tx = pool.begin_with("BEGIN IMMEDIATE")
        .await.map_err(db_error)?;

    sqlx::query(
        "INSERT INTO users (
            id, display_name, pronouns, native_language,
            target_language, avatar_data_url
         )
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO NOTHING"
    )
        .bind(&user.id)
        .bind(&user.display_name)
        .bind(&user.pronouns)
        .bind(&user.native_language)
        .bind(&user.target_language)
        .bind(&user.avatar_data_url)
        .execute(&mut *tx)
        .await
        .map_err(db_error)?;

    let saved = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE id = ?",
    )
        .bind(&user.id)
        .fetch_one(&mut *tx)
        .await
        .map_err(db_error)?;

    tx.commit().await.map_err(db_error)?;
    Ok(saved)
}

#[tauri::command]
pub async fn save_user_profile(databases: State<'_, DbInstances>, user: User) -> Result<User, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    // preserve onboarding behavior: native lang and avatar are not overwritten by profile updates
    sqlx::query_as::<_, User>(
        "INSERT INTO users (
            id, display_name, pronouns, native_language,
            target_language, avatar_data_url
         )
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            display_name = excluded.display_name,
            pronouns = excluded.pronouns,
            target_language = excluded.target_language
         RETURNING *",
    )
        .bind(user.id)
        .bind(user.display_name)
        .bind(user.pronouns)
        .bind(user.native_language)
        .bind(user.target_language)
        .bind(user.avatar_data_url)
        .fetch_one(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn save_user_identity(
    databases: State<'_, DbInstances>,
    user_id: String,
    display_name: String,
    pronouns: String,
    avatar_data_url: Option<String>) -> Result<(), CommandError> {
    let pool = database::pool(databases.inner()).await?;

    let result = sqlx::query(
        "UPDATE users
         SET display_name = ?, pronouns = ?, avatar_data_url = ?
         WHERE id = ?",
    )
        .bind(display_name)
        .bind(pronouns)
        .bind(avatar_data_url)
        .bind(user_id)
        .execute(&pool)
        .await
        .map_err(db_error)?;

    if result.rows_affected() != 1 {
        return Err(CommandError::app("The profile could not be found."));
    }

    Ok(())
}

#[tauri::command]
pub async fn save_user_target_language(databases: State<'_, DbInstances>, user_id: String, language: String) -> Result<(), CommandError> {
    let pool = database::pool(databases.inner()).await?;

    let result = sqlx::query(
        "UPDATE users SET target_language = ? WHERE id = ?",
    )
        .bind(language)
        .bind(user_id)
        .execute(&pool)
        .await
        .map_err(db_error)?;

    if result.rows_affected() != 1 {
        return Err(CommandError::app("The profile could not be found."));
    }

    Ok(())
}

#[tauri::command]
pub async fn delete_user(databases: State<'_, DbInstances>, id: String) -> Result<u64, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    Ok(sqlx::query("DELETE FROM users WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(db_error)?
        .rows_affected())
}

// USER SETTINGS
#[tauri::command]
pub async fn get_user_settings(databases: State<'_, DbInstances>, user_id: String) -> Result<Option<UserSettings>, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, UserSettings>(
        "SELECT * FROM user_settings WHERE user_id = ?",
    )
        .bind(user_id)
        .fetch_optional(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn save_user_settings(databases: State<'_, DbInstances>, value: UserSettings) -> Result<(), CommandError> {
    if !matches!(value.notifications, 0 | 1)
        || !value.font_size.is_finite()
        || value.font_size <= 0.0
    {
        return Err(CommandError::app("Invalid user settings."));
    }

    let pool = database::pool(databases.inner()).await?;

    sqlx::query(
        "INSERT INTO user_settings (
            user_id, notifications, theme, font_size
         )
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
            notifications = excluded.notifications,
            theme = excluded.theme,
            font_size = excluded.font_size",
    )
        .bind(value.user_id)
        .bind(value.notifications)
        .bind(value.theme)
        .bind(value.font_size)
        .execute(&pool)
        .await
        .map_err(db_error)?;

    Ok(())
}

// THREADS
#[tauri::command]
pub async fn get_thread(databases: State<'_, DbInstances>, id: String) -> Result<Option<Thread>, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, Thread>("SELECT * FROM threads WHERE id = ?")
        .bind(id)
        .fetch_optional(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn list_threads(databases: State<'_, DbInstances>, user_id: String, include_archived: bool) -> Result<Vec<Thread>, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, Thread>(
        "SELECT * FROM threads
         WHERE user_id = ? AND (? = 1 OR archived_at IS NULL)
         ORDER BY updated_at DESC, id",
    )
        .bind(user_id)
        .bind(include_archived)
        .fetch_all(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn create_thread(databases: State<'_, DbInstances>, user_id: String, title: String, topic: Option<String>) -> Result<Thread, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, Thread>(
        "INSERT INTO threads (
            id, user_id, title, topic,
            created_at, updated_at, archived_at
         )
         VALUES (
            lower(hex(randomblob(16))), ?, ?, ?,
            strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
            strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
            NULL
         )
         RETURNING *",
    )
        .bind(user_id)
        .bind(title)
        .bind(topic)
        .fetch_one(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn rename_thread(databases: State<'_, DbInstances>, id: String, title: String) -> Result<u64, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    Ok(sqlx::query(
        "UPDATE threads
         SET title = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE id = ?",
    )
        .bind(title)
        .bind(id)
        .execute(&pool)
        .await
        .map_err(db_error)?
        .rows_affected())
}

#[tauri::command]
pub async fn set_thread_archived(databases: State<'_, DbInstances>, id: String, archived: bool) -> Result<u64, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    Ok(sqlx::query(
        "UPDATE threads
         SET archived_at = CASE
                WHEN ? THEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                ELSE NULL
             END,
             updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE id = ?",
    )
        .bind(archived)
        .bind(id)
        .execute(&pool)
        .await
        .map_err(db_error)?
        .rows_affected())
}

#[tauri::command]
pub async fn delete_thread(databases: State<'_, DbInstances>, id: String) -> Result<u64, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    Ok(sqlx::query("DELETE FROM threads WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(db_error)?
        .rows_affected())
}

#[tauri::command]
pub async fn get_thread_history(databases: State<'_, DbInstances>, thread_id: String) -> Result<Option<ThreadHistory>, CommandError> {
    let pool = database::pool(databases.inner()).await?;
    let mut tx = pool.begin().await.map_err(db_error)?;

    let thread = sqlx::query_as::<_, Thread>(
        "SELECT * FROM threads WHERE id = ?",
    )
        .bind(&thread_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(db_error)?;

    let Some(thread) = thread else {
        tx.commit().await.map_err(db_error)?;
        return Ok(None);
    };

    let messages = sqlx::query_as::<_, Message>(
        "SELECT * FROM messages
         WHERE thread_id = ?
         ORDER BY sequence_no",
    )
        .bind(&thread_id)
        .fetch_all(&mut *tx)
        .await
        .map_err(db_error)?;

    tx.commit().await.map_err(db_error)?;
    Ok(Some(ThreadHistory { thread, messages }))
}

// MESSAGES
#[tauri::command]
pub async fn get_message(databases: State<'_, DbInstances>, id: String) -> Result<Option<Message>, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, Message>("SELECT * FROM messages WHERE id = ?")
        .bind(id)
        .fetch_optional(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn list_messages(databases: State<'_, DbInstances>, thread_id: String) -> Result<Vec<Message>, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, Message>(
        "SELECT * FROM messages WHERE thread_id = ? ORDER BY sequence_no",
    )
        .bind(thread_id)
        .fetch_all(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn append_message(
    databases: State<'_, DbInstances>,
    thread_id: String,
    role: String,
    content: String,
    response_id: Option<String>,
    item_id: Option<String>,
    id: Option<String>,
) -> Result<Message, CommandError> {
    if !matches!(
        role.as_str(),
        "user" | "assistant" | "system" | "developer" | "tool"
    ) {
        return Err(CommandError::app("Invalid message role."));
    }

    if id.as_ref().is_some_and(|value| value.is_empty()) {
        return Err(CommandError::app("Message ID cannot be empty."));
    }

    let pool = database::pool(databases.inner()).await?;
    let mut tx = pool.begin_with("BEGIN IMMEDIATE")
        .await
        .map_err(db_error)?;

    // A supplied ID preserves the controller's existing retry behavior.
    // Otherwise, generate the ID on the backend.
    let id: String = sqlx::query_scalar(
        "SELECT COALESCE(?, lower(hex(randomblob(16))))",
    )
        .bind(id)
        .fetch_one(&mut *tx)
        .await
        .map_err(db_error)?;

    sqlx::query(
        "INSERT INTO messages (
            id, thread_id, role, content, sequence_no,
            openai_response_id, openai_item_id, created_at
         )
         SELECT
            ?, ?, ?, ?, COALESCE(MAX(sequence_no) + 1, 0),
            ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         FROM messages
         WHERE thread_id = ?
         ON CONFLICT(id) DO NOTHING",
    )
        .bind(&id)
        .bind(&thread_id)
        .bind(&role)
        .bind(&content)
        .bind(&response_id)
        .bind(&item_id)
        .bind(&thread_id)
        .execute(&mut *tx)
        .await
        .map_err(db_error)?;

    let saved = sqlx::query_as::<_, Message>(
        "SELECT * FROM messages WHERE id = ?",
    )
        .bind(&id)
        .fetch_one(&mut *tx)
        .await
        .map_err(db_error)?;

    if saved.thread_id != thread_id
        || saved.role != role
        || saved.content != content
        || saved.openai_response_id != response_id
        || saved.openai_item_id != item_id
    {
        tx.rollback().await.map_err(db_error)?;

        return Err(CommandError::app("Message ID already belongs to different content."));
    }

    tx.commit().await.map_err(db_error)?;
    Ok(saved)
}

#[tauri::command]
pub async fn delete_message(databases: State<'_, DbInstances>, id: String) -> Result<u64, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    Ok(sqlx::query("DELETE FROM messages WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(db_error)?
        .rows_affected())
}

// STICKIES
fn validate_sticky_color(color: &str) -> Result<(), CommandError> {
    if !matches!(color, "red" | "blue" | "green" | "yellow" | "violet") {
        return Err(CommandError::app("Invalid sticky color."));
    }

    Ok(())
}

#[tauri::command]
pub async fn get_sticky(databases: State<'_, DbInstances>, id: String) -> Result<Option<Sticky>, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, Sticky>("SELECT * FROM stickies WHERE id = ?")
        .bind(id)
        .fetch_optional(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn list_stickies(databases: State<'_, DbInstances>, user_id: String) -> Result<Vec<Sticky>, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, Sticky>(
        "SELECT * FROM stickies WHERE user_id = ?
         ORDER BY created_at DESC, id",
    )
        .bind(user_id)
        .fetch_all(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn create_sticky(
    databases: State<'_, DbInstances>,
    user_id: String,
    selected_text: String,
    user_text: String,
    title: String,
    color: String,
) -> Result<Sticky, CommandError> {
    validate_sticky_color(&color)?;
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, Sticky>(
        "INSERT INTO stickies (
            id, user_id, selected_text, title,
            user_text, color, created_at, updated_at
         )
         VALUES (
            lower(hex(randomblob(16))), ?, ?, ?, ?, ?,
            strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
            strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         )
         RETURNING *",
    )
        .bind(user_id)
        .bind(selected_text)
        .bind(title.trim())
        .bind(user_text)
        .bind(color)
        .fetch_one(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn save_sticky(databases: State<'_, DbInstances>, sticky: Sticky) -> Result<Sticky, CommandError> {
    validate_sticky_color(&sticky.color)?;

    if sticky.id.is_empty() {
        return Err(CommandError::app("Sticky ID cannot be empty."));
    }

    let pool = database::pool(databases.inner()).await?;

    // existing UI drafts already have IDs and creation timestamps (accept for new rows; updates preserve immutable fields).
    sqlx::query_as::<_, Sticky>(
        "INSERT INTO stickies (
            id, user_id, selected_text, title,
            user_text, color, created_at, updated_at
         )
         VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         )
         ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            user_text = excluded.user_text,
            color = excluded.color,
            updated_at = excluded.updated_at
         WHERE stickies.user_id = excluded.user_id
         RETURNING *",
    )
        .bind(sticky.id)
        .bind(sticky.user_id)
        .bind(sticky.selected_text)
        .bind(sticky.title.trim())
        .bind(sticky.user_text)
        .bind(sticky.color)
        .bind(sticky.created_at)
        .fetch_optional(&pool)
        .await
        .map_err(db_error)?
        .ok_or_else(|| CommandError::app("Sticky ID already belongs to another user."))
}

#[tauri::command]
pub async fn update_sticky_text(databases: State<'_, DbInstances>, id: String, user_text: String) -> Result<u64, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    Ok(sqlx::query(
        "UPDATE stickies
         SET user_text = ?,
             updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE id = ?",
    )
        .bind(user_text)
        .bind(id)
        .execute(&pool)
        .await
        .map_err(db_error)?
        .rows_affected())
}

#[tauri::command]
pub async fn delete_sticky(databases: State<'_, DbInstances>, id: String) -> Result<u64, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    Ok(sqlx::query("DELETE FROM stickies WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(db_error)?
        .rows_affected())
}

// APP STATE
#[tauri::command]
pub async fn get_app_state(databases: State<'_, DbInstances>, ) -> Result<Option<AppState>, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query_as::<_, AppState>(
        "SELECT * FROM app_state WHERE id = 1",
    )
        .fetch_optional(&pool)
        .await
        .map_err(db_error)
}

#[tauri::command]
pub async fn complete_onboarding(databases: State<'_, DbInstances>, user_id: String) -> Result<(), CommandError> {
    let pool = database::pool(databases.inner()).await?;

    sqlx::query(
        "INSERT INTO app_state (
            id, active_user_id, onboarding_completed_at
         )
         VALUES (1, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
         ON CONFLICT(id) DO UPDATE SET
            active_user_id = excluded.active_user_id,
            onboarding_completed_at = excluded.onboarding_completed_at",
    )
        .bind(user_id)
        .execute(&pool)
        .await
        .map_err(db_error)?;

    Ok(())
}