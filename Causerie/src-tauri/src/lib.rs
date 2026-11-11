// use std::process::Command;
use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

mod account;
mod app_error;
mod chat;
mod dictionary;
mod languages;
mod learning;
mod reminders;
mod storage;

use app_error::CommandError;

pub use reminders::handle_cli as handle_reminder_cli;

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
    }, Migration {
        version: 8,
        description: "conversation_summaries",
        sql: include_str!("../migrations/0008_conversation_summaries.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 9,
        description: "message_hints",
        sql: include_str!("../migrations/0009_message_hints.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 10,
        description: "practice_reminders",
        sql: include_str!("../migrations/0010_practice_reminders.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 11,
        description: "user_proficiency",
        sql: include_str!("../migrations/0011_user_proficiency.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 12,
        description: "feedback_read",
        sql: include_str!("../migrations/0012_feedback_read.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 13,
        description: "sticky_categories",
        sql: include_str!("../migrations/0013_sticky_categories.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 14,
        description: "personal_dictionary",
        sql: include_str!("../migrations/0014_personal_dictionary.sql"),
        kind: MigrationKind::Up,
    }, Migration {
        version: 15,
        description: "voice_threads",
        sql: include_str!("../migrations/0015_voice_threads.sql"),
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
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            chat::conversation::send_message,
            account::credentials::save_openai_api_key,
            account::credentials::has_openai_api_key,
            account::factory_reset::reset_application,
            learning::goals::initialize_goal_catalog,
            learning::goals::get_goal_settings,
            learning::goals::save_goal_settings,
            learning::corrections::get_correction,
            learning::corrections::list_corrections,
            learning::corrections::create_correction,
            learning::corrections::delete_correction,
            learning::feedback::analyze_message,
            storage::persistence::initialize_database,
            storage::persistence::get_user,
            storage::persistence::list_users,
            storage::persistence::create_user,
            storage::persistence::update_user,
            storage::persistence::create_user_if_missing,
            storage::persistence::save_user_profile,
            storage::persistence::save_user_identity,
            storage::persistence::save_user_target_language,
            storage::persistence::delete_user,
            storage::persistence::get_user_settings,
            storage::persistence::save_user_settings,
            storage::persistence::get_thread,
            storage::persistence::list_threads,
            storage::persistence::create_thread,
            storage::persistence::rename_thread,
            storage::persistence::set_thread_archived,
            storage::persistence::delete_thread,
            storage::persistence::get_thread_history,
            storage::persistence::get_message,
            storage::persistence::list_messages,
            storage::persistence::append_message,
            storage::persistence::delete_message,
            storage::persistence::get_sticky,
            storage::persistence::list_stickies,
            storage::persistence::create_sticky,
            storage::persistence::save_sticky,
            storage::persistence::update_sticky_text,
            storage::persistence::delete_sticky,
            storage::persistence::get_app_state,
            storage::persistence::complete_onboarding,
            dictionary::lookup::lookup_dictionary,
            learning::hints::list_message_hints,
            learning::hints::request_message_hint,
            chat::thread_topics::list_thread_topics,
            chat::thread_starters::create_generated_thread,
            reminders::get_practice_reminders,
            reminders::save_practice_reminders,
            learning::proficiency::get_proficiency,
            learning::proficiency::save_proficiency,
            learning::feedback::list_feedback_states,
            learning::feedback::mark_feedback_read,
            chat::turn_cancellations::cancel_message,
            chat::turn_cancellations::discard_cancelled_turn,
            dictionary::spelling::check_spelling,
            dictionary::personal_dictionary::list_personal_words,
            dictionary::personal_dictionary::add_personal_word,
            dictionary::personal_dictionary::remove_personal_word,
            dictionary::lookup::lookup_english_word,
            chat::language_validation::validate_user_language,
            chat::voice::transcribe_voice,
            chat::voice::speak_message,
    ])
        .setup(move |app| {
            // No database, logger files, or WebView exists yet.
            account::factory_reset::finish_pending_reset(app.handle())
                .map_err(std::io::Error::other)?;

            let local_data_dir = app.path().app_local_data_dir()?;
            std::fs::create_dir_all(&local_data_dir)?;

            app.manage(account::credentials::CredentialStore::new(
                local_data_dir,
            ));

            app.manage(dictionary::lookup::DictionaryClient::new()
                .map_err(std::io::Error::other)?);

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
