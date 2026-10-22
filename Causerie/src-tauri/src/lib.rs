// use std::process::Command;
use serde::Serialize;
use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

mod credentials;
mod factory_reset;
mod database;
mod goals;
mod context;
mod corrections;
mod conversation;
mod feedback_repository;
mod feedback;
// use tauri::utils::config::CustomSignCommandConfig::Command;


// Structured errors from Rust to React
#[derive(Debug, Serialize)]
struct CommandError {
    kind: &'static str,
    message: String,
}
// IMPL SEPARATES OPENAI ERRORS (delivered to mascot) from APP ERRORS (delivered via toast)
impl CommandError {
    fn app(message: impl Into<String>) -> Self {
        Self {
            kind: "app",
            message: message.into(),
        }
    }

    fn openai(message: impl Into<String>) -> Self {
        Self {
            kind: "openai",
            message: message.into(),
        }
    }
}


use tauri_plugin_log::{Target, TargetKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "mvp_schema",
        sql: include_str!("../migrations/0001_mvp.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 2,
        description: "thread_activity",
        sql: include_str!("../migrations/0002_thread_activity.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 3,
        description: "app_state",
        sql: include_str!("../migrations/0003_app_state.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 4,
        description: "sticky_details",
        sql: include_str!("../migrations/0004_sticky_details.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 5,
        description: "thread_activity_details",
        sql: include_str!("../migrations/0005_profile_avatar.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 6,
        description: "user_goals",
        sql: include_str!("../migrations/0006_user_goals.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 7,
        description: "teacher_feedback",
        sql: include_str!("../migrations/0007_teacher_feedback.sql"),
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            conversation::send_message,
            credentials::save_openai_api_key,
            credentials::has_openai_api_key,
            factory_reset::reset_application,
            goals::initialize_goal_catalog,
            goals::get_goal_settings,
            goals::save_goal_settings,
            corrections::get_correction,
            corrections::list_corrections,
            corrections::create_correction,
            corrections::delete_correction,
            feedback::analyze_message,
    ])
        .setup(move |app| {
            // No database, logger files, or WebView exists yet.
            factory_reset::finish_pending_reset(app.handle())
                .map_err(std::io::Error::other)?;

            let local_data_dir = app.path().app_local_data_dir()?;
            std::fs::create_dir_all(&local_data_dir)?;

            app.manage(credentials::CredentialStore::new(
                local_data_dir,
            ));

            // These registrations moved from the outer builder.
            app.handle().plugin(
                tauri_plugin_log::Builder::new()
                    .level(tauri_plugin_log::log::LevelFilter::Debug)
                    .targets([
                        Target::new(TargetKind::Stdout),
                        Target::new(TargetKind::LogDir {
                            file_name: None,
                        }),
                        Target::new(TargetKind::Webview),
                    ])
                    .build(),
            )?;

            app.handle().plugin(
                tauri_plugin_sql::Builder::default()
                    .add_migrations("sqlite:causerie.db", migrations)
                    .build(),
            )?;

            let window_config = app.config().app.windows
                .iter()
                .find(|window| window.label == "main")
                .ok_or_else(|| {
                    std::io::Error::other(
                        "Main window configuration is missing.",
                    )
                })?
                .clone();

            tauri::WebviewWindowBuilder::from_config(
                app,
                &window_config,
            )?
                .build()?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

}
