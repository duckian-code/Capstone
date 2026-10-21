use sqlx::SqlitePool;
use tauri_plugin_sql::{DbInstances, DbPool};

use crate::CommandError;

pub(crate) async fn pool(databases: &DbInstances) -> Result<SqlitePool, CommandError> {
    let databases = databases.0.read().await;

    let Some(DbPool::Sqlite(pool)) = databases.get("sqlite:causerie.db") else {
        return Err(CommandError::app("The database is not ready."));
    };

    Ok(pool.clone())
}