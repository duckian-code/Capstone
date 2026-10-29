use std::{
    fs::{File, OpenOptions},
    path::{Path, PathBuf},
    time::Duration,
};

use chrono::{Local, NaiveDate, NaiveDateTime, NaiveTime};
use fs2::FileExt;
use serde::{Deserialize, Serialize};
use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
    SqlitePool,
};
use tauri::State;
use tauri_plugin_sql::DbInstances;

use crate::{database, languages, reminder_scheduler, CommandError};

const APP_ID: &str = "com.anabelle.causerie";

// TODO: ADD MORE LANGUAGESSSS
const FRENCH: [&str; 5] = [
    "Tu as cinq minutes ? Viens me raconter un petit bout de ta journée.",
    "J’ai envie de discuter. Ouvre Causerie et raconte-moi ce qui t’occupe l’esprit.",
    "Une petite pause pour parler français ? Pas besoin d’un sujet extraordinaire.",
    "Ton clavier et moi, on attend ton prochain message. Tu viens discuter ?",
    "Une bonne surprise, un petit souci, une idée bizarre… Tu me racontes ?",
];

const SPANISH: [&str; 5] = [
    "¿Tienes cinco minutos? Ven a contarme un poquito de tu día.",
    "Oye, tengo ganas de conversar. Abre Causerie y cuéntame qué tienes en mente.",
    "¿Hacemos una pausa para hablar español? No hace falta un tema extraordinario.",
    "Tu teclado y yo esperamos tu próximo mensaje. ¿Vienes a conversar?",
    "Una buena sorpresa, un pequeño lío, una idea curiosa… ¿Me cuentas?",
];

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct ReminderSettings {
    enabled: bool,
    every_days: u32,
    at_time: String,
    start_date: String,
}

#[derive(Serialize)]
pub struct ReminderView {
    settings: ReminderSettings,
    last_error: Option<String>,
}

#[derive(sqlx::FromRow)]
struct ReminderRow {
    user_id: String,
    enabled: bool,
    every_days: i64,
    at_time: String,
    start_date: String,
    last_sent_date: Option<String>,
    next_variant: i64,
    last_error: Option<String>,
    language: String,
}

impl ReminderRow {
    fn settings(&self) -> ReminderSettings {
        ReminderSettings {
            enabled: self.enabled,
            every_days: self.every_days as u32,
            at_time: self.at_time.clone(),
            start_date: self.start_date.clone(),
        }
    }
}

fn defaults() -> ReminderSettings {
    ReminderSettings {
        enabled: false,
        every_days: 1,
        at_time: "19:00".into(),
        start_date: Local::now().format("%Y-%m-%d").to_string(),
    }
}

fn validate(settings: &ReminderSettings) -> Result<(), String> {
    if !(1..=30).contains(&settings.every_days) {
        return Err("Choose an interval between 1 and 30 days.".into());
    }

    let time = NaiveTime::parse_from_str(&settings.at_time, "%H:%M")
        .map_err(|_| "Choose a valid reminder time.")?;

    let date = NaiveDate::parse_from_str(&settings.start_date, "%Y-%m-%d")
        .map_err(|_| "Choose a valid start date.")?;

    if time.format("%H:%M").to_string() != settings.at_time
        || date.format("%Y-%m-%d").to_string() != settings.start_date
    {
        return Err("Invalid reminder date or time format.".into());
    }

    Ok(())
}

fn is_due(
    settings: &ReminderSettings,
    now: NaiveDateTime,
    last_sent: Option<&str>,
) -> bool {
    if !settings.enabled || validate(settings).is_err() {
        return false;
    }

    let start = NaiveDate::parse_from_str(&settings.start_date, "%Y-%m-%d")
        .expect("validated date");

    let time = NaiveTime::parse_from_str(&settings.at_time, "%H:%M")
        .expect("validated time");

    let today = now.date();
    let date_text = today.format("%Y-%m-%d").to_string();
    let days = today.signed_duration_since(start).num_days();

    if days < 0
        || days % i64::from(settings.every_days) != 0
        || last_sent == Some(date_text.as_str())
    {
        return false;
    }

    let lateness = now.signed_duration_since(today.and_time(time)).num_seconds();

    // No backlog after long sleeps or offline periods
    (0..=600).contains(&lateness)
}

async fn db_path(pool: &SqlitePool) -> Result<PathBuf, String> {
    let filename: String = sqlx::query_scalar(
        "SELECT file FROM pragma_database_list WHERE name = 'main'",
    )
        .fetch_one(pool)
        .await
        .map_err(|error| error.to_string())?;

    if filename.is_empty() {
        return Err("Reminders require a persistent database.".into());
    }

    Ok(PathBuf::from(filename))
}

fn acquire_lock(db: &Path) -> Result<File, String> {
    let file = OpenOptions::new()
        .create(true)
        .truncate(false)
        .read(true)
        .write(true)
        .open(db.with_extension("reminders.lock"))
        .map_err(|error| error.to_string())?;

    file.try_lock_exclusive().map_err(|_| {
        "A reminder operation is already running. Please try again.".to_owned()
    })?;

    Ok(file)
}

async fn current(pool: &SqlitePool) -> Result<Option<ReminderRow>, sqlx::Error> {
    sqlx::query_as::<_, ReminderRow>(
        "SELECT r.*, COALESCE(u.target_language, 'French') AS language
         FROM practice_reminders r
         JOIN users u ON u.id = r.user_id
         JOIN app_state s ON s.id = 1 AND s.active_user_id = r.user_id",
    )
        .fetch_optional(pool)
        .await
}

async fn active_language(
    pool: &SqlitePool,
    user_id: &str,
) -> Result<String, CommandError> {
    sqlx::query_scalar::<_, String>(
        "SELECT COALESCE(u.target_language, 'French')
         FROM users u
         JOIN app_state s ON s.id = 1 AND s.active_user_id = u.id
         WHERE u.id = ?",
    )
        .bind(user_id)
        .fetch_optional(pool)
        .await
        .map_err(database::error)?
        .ok_or_else(|| CommandError::app("This profile is not active."))
}

async fn register(
    db: PathBuf,
    settings: ReminderSettings,
) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        reminder_scheduler::apply(
            &db,
            settings.enabled.then_some(settings.at_time.as_str()),
        )
    })
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
pub async fn get_practice_reminders(
    databases: State<'_, DbInstances>,
    user_id: String,
) -> Result<ReminderView, CommandError> {
    let pool = database::pool(databases.inner()).await?;
    active_language(&pool, &user_id).await?;

    let row = current(&pool).await.map_err(database::error)?;

    Ok(match row {
        Some(row) => ReminderView {
            settings: row.settings(),
            last_error: row.last_error,
        },
        None => ReminderView {
            settings: defaults(),
            last_error: None,
        },
    })
}

#[tauri::command]
pub async fn save_practice_reminders(
    databases: State<'_, DbInstances>,
    user_id: String,
    settings: ReminderSettings,
) -> Result<ReminderView, CommandError> {
    validate(&settings).map_err(CommandError::app)?;

    let pool = database::pool(databases.inner()).await?;
    let language = active_language(&pool, &user_id).await?;

    if settings.enabled {
        languages::profile(&language)?;
    }

    let db = db_path(&pool).await.map_err(CommandError::app)?;
    let _lock = acquire_lock(&db).map_err(CommandError::app)?;

    let previous = current(&pool)
        .await
        .map_err(database::error)?
        .map(|row| row.settings())
        .unwrap_or_else(defaults);

    // The worker shares this lock, so it cannot deliver while schedule registration and database persistence are being coordinated
    if let Err(error) = register(db.clone(), settings.clone()).await {
        let restoration = register(db.clone(), previous.clone()).await.err();

        return Err(CommandError::app(format!(
            "Reminders were not saved: {error}{}",
            restoration
                .map(|value| format!(" Restoring the previous schedule also failed: {value}"))
                .unwrap_or_default(),
        )));
    }

    let result = sqlx::query(
        "INSERT INTO practice_reminders (
            user_id, enabled, every_days, at_time, start_date
         )
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
            enabled = excluded.enabled,
            every_days = excluded.every_days,
            at_time = excluded.at_time,
            start_date = excluded.start_date,
            last_error = NULL",
    )
        .bind(&user_id)
        .bind(settings.enabled)
        .bind(i64::from(settings.every_days))
        .bind(&settings.at_time)
        .bind(&settings.start_date)
        .execute(&pool)
        .await;

    if let Err(error) = result {
        let restoration = register(db, previous).await.err();

        return Err(CommandError::app(format!(
            "Unable to save reminder settings: {error}{}",
            restoration
                .map(|value| format!(" Restoring the previous schedule also failed: {value}"))
                .unwrap_or_default(),
        )));
    }

    Ok(ReminderView {
        settings,
        last_error: None,
    })
}

// re-register on startup to repair changed exec paths
pub(crate) async fn reconcile(pool: &SqlitePool) -> Result<(), String> {
    let db = db_path(pool).await?;
    let _lock = acquire_lock(&db)?;

    let row = current(pool).await.map_err(|error| error.to_string())?;

    let settings = row
        .as_ref()
        .map(ReminderRow::settings)
        .unwrap_or_else(defaults);

    let result = register(db, settings).await;

    if let Some(row) = row {
        sqlx::query(
            "UPDATE practice_reminders SET last_error = ? WHERE user_id = ?",
        )
            .bind(result.as_ref().err().map(String::as_str))
            .bind(row.user_id)
            .execute(pool)
            .await
            .map_err(|error| error.to_string())?;
    }

    result
}

pub(crate) async fn disable_for_reset(pool: &SqlitePool) -> Result<(), String> {
    let db = db_path(pool).await?;
    let _lock = acquire_lock(&db)?;

    // Even if OS cleanup fails, the remaining worker will do nothing
    sqlx::query("UPDATE practice_reminders SET enabled = 0")
        .execute(pool)
        .await
        .map_err(|error| error.to_string())?;

    register(db, defaults()).await
}

fn show_notification(body: &str) -> Result<notify_rust::NotificationHandle, String> {
    #[cfg(target_os = "macos")]
    notify_rust::set_application(APP_ID)
        .map_err(|error| format!("Unable to configure notifications: {error}"))?;

    let mut notification = notify_rust::Notification::new();

    notification
        .appname("Causerie")
        .summary("Dot · Causerie")
        .body(body)
        .timeout(notify_rust::Timeout::Milliseconds(12_000));

    #[cfg(target_os = "windows")]
    notification.app_id(APP_ID);

    notification.show().map_err(|error| error.to_string())
}

async fn deliver_due(db: &Path) -> Result<(), String> {
    // Never recreate a database after reset/uninstallation.
    if !db.is_file() {
        return Ok(());
    }

    let lock = match acquire_lock(db) {
        Ok(lock) => lock,
        Err(_) => return Ok(()),
    };

    let options = SqliteConnectOptions::new()
        .filename(db)
        .create_if_missing(false)
        .busy_timeout(Duration::from_secs(5));

    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect_with(options)
        .await
        .map_err(|error| error.to_string())?;

    let Some(row) = current(&pool).await.map_err(|error| error.to_string())? else {
        return Ok(());
    };

    let now = Local::now().naive_local();

    if !is_due(&row.settings(), now, row.last_sent_date.as_deref()) {
        return Ok(());
    }

    let profile = languages::profile(&row.language)
        .map_err(|error| error.message)?;

    let messages = match profile.code {
        "fr" => &FRENCH,
        "es" => &SPANISH,
        _ => return Err("No reminder messages exist for this language.".into()),
    };

    let index = row.next_variant.rem_euclid(messages.len() as i64) as usize;
    let today = now.date().format("%Y-%m-%d").to_string();

    // Claim the local date before contacting the notification service.
    // A crash favors missing one reminder over delivering duplicates.
    let claimed = sqlx::query(
        "UPDATE practice_reminders
         SET last_sent_date = ?
         WHERE user_id = ?
           AND enabled = 1
           AND (last_sent_date IS NULL OR last_sent_date != ?)
           AND EXISTS (
               SELECT 1 FROM app_state
               WHERE id = 1 AND active_user_id = ?
           )",
    )
        .bind(&today)
        .bind(&row.user_id)
        .bind(&today)
        .bind(&row.user_id)
        .execute(&pool)
        .await
        .map_err(|error| error.to_string())?
        .rows_affected();

    if claimed == 0 {
        return Ok(());
    }

    let handle = match show_notification(messages[index]) {
        Ok(handle) => handle,
        Err(error) => {
            sqlx::query(
                "UPDATE practice_reminders
                 SET last_sent_date = ?, last_error = ?
                 WHERE user_id = ?",
            )
                .bind(&row.last_sent_date)
                .bind(&error)
                .bind(&row.user_id)
                .execute(&pool)
                .await
                .map_err(|db_error| db_error.to_string())?;

            return Err(error);
        }
    };

    sqlx::query(
        "UPDATE practice_reminders
         SET next_variant = ?, last_error = NULL
         WHERE user_id = ?",
    )
        .bind(((index + 1) % messages.len()) as i64)
        .bind(&row.user_id)
        .execute(&pool)
        .await
        .map_err(|error| error.to_string())?;

    pool.close().await;
    drop(lock);

    // Some Linux notification servers remove notifications when the sending process disconnects. Keep the sender alive briefly.
    tokio::time::sleep(Duration::from_secs(12)).await;
    drop(handle);

    Ok(())
}

// returns None for a regular app launch
pub fn handle_cli() -> Option<i32> {
    let mut args = std::env::args_os().skip(1);

    if args.next().as_deref() != Some(std::ffi::OsStr::new("--reminder-check")) {
        return None;
    }

    let Some(db) = args.next() else {
        return Some(1);
    };

    if args.next().is_some() {
        return Some(1);
    }

    let runtime = match tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
    {
        Ok(runtime) => runtime,
        Err(_) => return Some(1),
    };

    match runtime.block_on(deliver_due(&PathBuf::from(db))) {
        Ok(()) => Some(0),
        Err(error) => {
            eprintln!("Causerie reminder failed: {error}");
            Some(1)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn settings() -> ReminderSettings {
        ReminderSettings {
            enabled: true,
            every_days: 2,
            at_time: "19:00".into(),
            start_date: "2026-10-28".into(),
        }
    }

    fn at(value: &str) -> NaiveDateTime {
        NaiveDateTime::parse_from_str(value, "%Y-%m-%d %H:%M:%S").unwrap()
    }

    #[test]
    fn respects_interval_and_start_date() {
        let settings = settings();

        assert!(!is_due(&settings, at("2026-10-27 19:00:00"), None));
        assert!(is_due(&settings, at("2026-10-28 19:00:00"), None));
        assert!(!is_due(&settings, at("2026-10-29 19:00:00"), None));
        assert!(is_due(&settings, at("2026-10-30 19:00:00"), None));
    }

    #[test]
    fn skips_early_late_and_duplicate_delivery() {
        let settings = settings();

        assert!(!is_due(&settings, at("2026-10-28 18:59:59"), None));
        assert!(!is_due(&settings, at("2026-10-28 19:10:01"), None));
        assert!(!is_due(
            &settings,
            at("2026-10-28 19:00:00"),
            Some("2026-10-28"),
        ));
    }

    #[test]
    fn disabled_reminders_do_not_fire() {
        let mut settings = settings();
        settings.enabled = false;

        assert!(!is_due(&settings, at("2026-10-28 19:00:00"), None));
    }
}