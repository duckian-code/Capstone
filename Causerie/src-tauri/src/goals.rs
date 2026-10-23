use std::collections::HashSet;

use serde::{Deserialize, Serialize};
use sqlx::{SqliteConnection, SqlitePool};
use tauri::{path::BaseDirectory, AppHandle, Manager, State};
use tauri_plugin_sql::{DbInstances};
use crate::database::pool as database_pool;

use crate::CommandError;

pub type GoalSlots = [Option<String>; 3];

#[derive(Clone, Serialize)]
pub struct GoalDefinition {
    pub id: String,
    pub label: String,
    pub active: bool,
}

#[derive(Serialize)]
pub struct GoalSettings {
    pub catalog: Vec<GoalDefinition>,
    pub slots: GoalSlots,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct CatalogEntry {
    id: String,
    label: String,
}

fn db_error(error: sqlx::Error) -> CommandError {
    log::error!("Goal persistence failed: {error}");
    CommandError::app("Unable to load or save learning goals. Please try again.")
}

fn read_catalog(app: &AppHandle) -> Result<Vec<CatalogEntry>, CommandError> {
    let path = app
        .path()
        .resolve("resources/goals.json", BaseDirectory::Resource)
        .map_err(|_| CommandError::app("Unable to locate the goal catalog."))?;

    let json = std::fs::read_to_string(&path).map_err(|error| {
        log::error!(
            "Unable to read goal catalog {}: {error}",
            path.display(),
        );

        CommandError::app("Unable to read the goal catalog.")
    })?;

    let entries: Vec<CatalogEntry> =
        serde_json::from_str(&json).map_err(|error| {
            log::error!("Invalid goal catalog JSON: {error}");

            CommandError::app("The goal catalog contains invalid JSON.")
        })?;

    let mut ids = HashSet::new();

    for entry in &entries {
        if entry.id.is_empty() || entry.id.trim() != entry.id {
            return Err(CommandError::app("Goal IDs must be nonempty and have no surrounding whitespace."));
        }

        if entry.label.trim().is_empty() {
            return Err(CommandError::app("Goal labels must not be empty."));
        }

        if !ids.insert(entry.id.as_str()) {
            return Err(CommandError::app(format!("The goal catalog contains a duplicate ID: {}.", entry.id)));
        }
    }

    Ok(entries)
}

mod repository {
    use super::*;

    pub async fn is_initialized(pool: &SqlitePool) -> Result<bool, CommandError> {
        let initialized: i64 = sqlx::query_scalar(
            "SELECT initialized FROM goal_catalog_state WHERE id = 1",
        )
            .fetch_one(pool)
            .await
            .map_err(db_error)?;

        Ok(initialized == 1)
    }

    pub async fn synchronize(pool: &SqlitePool, entries: &[CatalogEntry]) -> Result<(), CommandError> {
        let mut transaction = pool.begin().await.map_err(db_error)?;

        // missing definitions become inactive preserving assignments
        sqlx::query("UPDATE goal_catalog SET active = 0")
            .execute(&mut *transaction)
            .await
            .map_err(db_error)?;

        for (order, entry) in entries.iter().enumerate() {
            sqlx::query(
                "INSERT INTO goal_catalog (id, label, display_order, active)
                 VALUES (?, ?, ?, 1)
                 ON CONFLICT(id) DO UPDATE SET
                     label = excluded.label,
                     display_order = excluded.display_order,
                     active = 1"
            )
                .bind(&entry.id)
                .bind(&entry.label)
                .bind(order as i64)
                .execute(&mut *transaction)
                .await
                .map_err(db_error)?;
        }

        let initialized: i64 = sqlx::query_scalar(
            "SELECT initialized FROM goal_catalog_state WHERE id = 1",
        )
            .fetch_one(&mut *transaction)
            .await
            .map_err(db_error)?;

        if initialized == 0 {
            // import distinct supported legacy goals once in catalog order
            sqlx::query(
                "WITH matched AS (
                    SELECT DISTINCT
                        g.user_id,
                        c.id AS goal_id,
                        c.display_order
                    FROM goals g
                    JOIN goal_catalog c ON c.label = g.title
                    WHERE c.active = 1
                 ), ranked AS (
                    SELECT user_id, goal_id,
                        ROW_NUMBER() OVER (
                            PARTITION BY user_id
                            ORDER BY display_order, goal_id
                        ) - 1 AS slot
                    FROM matched
                 )
                 INSERT INTO user_goals (user_id, goal_id, slot)
                 SELECT user_id, goal_id, slot
                 FROM ranked
                 WHERE slot < 3
                 ON CONFLICT DO NOTHING"
            )
                .execute(&mut *transaction)
                .await
                .map_err(db_error)?;
        }

        sqlx::query("UPDATE goal_catalog_state SET initialized = 1 WHERE id = 1", )
            .execute(&mut *transaction)
            .await
            .map_err(db_error)?;

        transaction.commit().await.map_err(db_error)?;

        Ok(())
    }

    pub async fn read(
        connection: &mut SqliteConnection,
        user_id: &str,
    ) -> Result<GoalSettings, CommandError> {
        let exists: i64 = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)",
        )
            .bind(user_id)
            .fetch_one(&mut *connection)
            .await
            .map_err(db_error)?;

        if exists == 0 {
            return Err(CommandError::app("The profile could not be found.", ));
        }

        // include retired definitions only when this user has them assigned
        let definitions = sqlx::query_as::<_, (String, String, i64)>(
            "SELECT id, label, active
             FROM goal_catalog
             WHERE active = 1
                OR id IN (
                    SELECT goal_id FROM user_goals WHERE user_id = ?
                )
             ORDER BY active DESC, display_order, id",
        )
            .bind(user_id)
            .fetch_all(&mut *connection)
            .await
            .map_err(db_error)?;

        let assignments = sqlx::query_as::<_, (i64, String)>(
            "SELECT slot, goal_id
             FROM user_goals
             WHERE user_id = ?
             ORDER BY slot",
        )
            .bind(user_id)
            .fetch_all(&mut *connection)
            .await
            .map_err(db_error)?;

        let catalog = definitions
            .into_iter()
            .map(|(id, label, active)| GoalDefinition {
                id,
                label,
                active: active == 1,
            })
            .collect();

        let mut slots: GoalSlots = [None, None, None];

        for (slot, goal_id) in assignments {
            // Enforced by user_goals.slot's database constraint.
            slots[slot as usize] = Some(goal_id);
        }

        Ok(GoalSettings { catalog, slots })
    }

    pub async fn replace(connection: &mut SqliteConnection, user_id: &str, slots: &GoalSlots) -> Result<(), CommandError> {
        sqlx::query("DELETE FROM user_goals WHERE user_id = ?")
            .bind(user_id)
            .execute(&mut *connection)
            .await
            .map_err(db_error)?;

        for (slot, goal_id) in slots.iter().enumerate() {
            let Some(goal_id) = goal_id else {
                continue;
            };

            sqlx::query("INSERT INTO user_goals (user_id, goal_id, slot)
                 VALUES (?, ?, ?)")
                .bind(user_id)
                .bind(goal_id)
                .bind(slot as i64)
                .execute(&mut *connection)
                .await
                .map_err(db_error)?;
        }

        Ok(())
    }
}

// reusable backend service entry point for the future context builder
pub(crate) async fn load_for_user(pool: &SqlitePool, user_id: &str) -> Result<GoalSettings, CommandError> {
    let mut transaction = pool.begin().await.map_err(db_error)?;

    let settings = repository::read(&mut *transaction, user_id).await?;

    transaction.commit().await.map_err(db_error)?;

    Ok(settings)
}

pub(crate) async fn save_for_user(pool: &SqlitePool, user_id: &str, slots: GoalSlots) -> Result<GoalSettings, CommandError> {
    let mut transaction = pool.begin().await.map_err(db_error)?;

    let current = repository::read(&mut *transaction, user_id).await?;

    for (index, goal_id) in slots.iter().enumerate() {
        let Some(goal_id) = goal_id else {
            continue;
        };

        let Some(definition) = current
            .catalog
            .iter()
            .find(|goal| &goal.id == goal_id)
        else {
            return Err(CommandError::app("Select a supported learning goal."));
        };

        // retired assignments may remain in their existing slots
        if !definition.active
            && current.slots[index].as_ref() != Some(goal_id)
        {
            return Err(CommandError::app("This goal has been retired. Select an available goal."));
        }

        if slots[..index]
            .iter()
            .flatten()
            .any(|previous| previous == goal_id)
        {
            return Err(CommandError::app("Each selected learning goal must be different."));
        }
    }

    repository::replace(&mut *transaction, user_id, &slots).await?;

    // return saved state (including removal of retired choices)
    let saved = repository::read(&mut *transaction, user_id).await?;

    transaction.commit().await.map_err(db_error)?;

    Ok(saved)
}

#[tauri::command]
pub async fn initialize_goal_catalog(app: AppHandle, databases: State<'_, DbInstances>) -> Result<(), CommandError> {
    let pool = database_pool(databases.inner()).await?;

    let entries = match read_catalog(&app) {
        Ok(entries) => entries,
        Err(error) => {
            if repository::is_initialized(&pool).await? {
                log::warn!("Using the saved goal catalog because loading failed: {}", error.message);

                return Ok(());
            }

            return Err(error);
        }
    };

    repository::synchronize(&pool, &entries).await
}

pub(crate) async fn load_for_user_in_transaction(conn: &mut SqliteConnection, user_id: &str) -> Result<GoalSettings, CommandError> {
    repository::read(conn, user_id).await
}

#[tauri::command]
pub async fn get_goal_settings(databases: State<'_, DbInstances>, user_id: String) -> Result<GoalSettings, CommandError> {
    let pool = database_pool(databases.inner()).await?;

    load_for_user(&pool, &user_id).await
}

#[tauri::command]
pub async fn save_goal_settings(databases: State<'_, DbInstances>, user_id: String, slots: GoalSlots) -> Result<GoalSettings, CommandError> {
    let pool = database_pool(databases.inner()).await?;

    save_for_user(&pool, &user_id, slots).await
}
