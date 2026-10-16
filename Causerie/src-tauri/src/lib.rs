// use std::process::Command;
use futures::StreamExt;
use openai_rust_sdk::{
    client::OpenAIClient,
    models::responses_v2::{CreateResponseRequest, ResponseStreamEvent},
};
use serde::Serialize;
use tauri::ipc::Channel;
use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};
mod credentials;
// use tauri::utils::config::CustomSignCommandConfig::Command;

// Messages from Rust to React
#[derive(Clone, Serialize)]
#[serde(tag = "event", content = "data", rename_all = "camelCase")]
enum StreamEvent {
    Chunk { text: String },
}

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

#[tauri::command]
async fn send_message(app: tauri::AppHandle, message: String, on_event: Channel<StreamEvent>) -> Result<String, CommandError> {
    log::info!("OpenAI request started");

    let message = message.trim();

    if message.is_empty() {
        return Err(CommandError::app("Please enter a message."));
    }

    let api_key = credentials::resolve_api_key(app).await
        .map_err(CommandError::app)?;

    let client = OpenAIClient::new(api_key.to_string())
        .map_err(|_| CommandError::app("Unable to initialize API client!"))?;

    // TODO: make model integration by configuration instead of hardcode
    let request = CreateResponseRequest::new_text("gpt-4o-mini", message);

    let mut stream = client.stream_response_v2(&request).await.map_err(|e| {
        log::error!("OpenAI request failed: {e}");
        CommandError::app(e.to_string())
    })?;

    let mut completed = false;
    let mut received_text = false;
    let mut full_text = String::new();

    while let Some(event) = stream.next().await {
        match event.map_err(|e| CommandError::openai(e.to_string()))? {
            ResponseStreamEvent::OutputTextDelta { delta, .. } => {
                if !delta.is_empty() {
                    received_text = true;
                    full_text.push_str(&delta);

                    on_event
                        .send(StreamEvent::Chunk { text: delta })
                        .map_err(|e| CommandError::app(e.to_string()))?;
                }
            }

            ResponseStreamEvent::ResponseCompleted { .. } => {
                completed = true;
            }

            ResponseStreamEvent::StreamError { error, .. } => {
                return Err(CommandError::openai(
                    error
                        .message
                        .unwrap_or_else(|| "OpenAI stream error".to_string()),
                ));
            }

            _ => {}
        }
    }

    if !completed {
        return Err(CommandError::openai(
            "Response stream ended without completion.",
        ));
    }

    if !received_text {
        return Err(CommandError::openai("API returned no text!"));
    }

    Ok(full_text)
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
    },];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Debug) // TODO: CHANGE TO Info or Warn for PROD
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .build(),
        )
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:causerie.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![send_message, credentials::save_openai_api_key, credentials::has_openai_api_key])
        .setup(|app| {
            let local_data_dir = app
                .path()
                .app_local_data_dir()?;

            std::fs::create_dir_all(&local_data_dir)?;

            app.manage(credentials::CredentialStore::new(local_data_dir));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
