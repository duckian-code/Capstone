use openai_rust_sdk::client::OpenAIClient;
use serde::Serialize;
use tauri::ipc::Channel;

use crate::{
    account::credentials,
    chat::{ context::ContextManager, conversation_memory, validated_reply },
    storage::database,
    CommandError,
};

#[derive(Clone, Serialize)]
#[serde(tag = "event", content = "data", rename_all = "camelCase")]
pub enum StreamEvent {
    Chunk { text: String },
}

async fn send_message_inner(
    app: tauri::AppHandle,
    databases: tauri::State<'_, tauri_plugin_sql::DbInstances>,
    thread_id: String,
    user_message_id: String,
    on_event: Channel<StreamEvent>,
) -> Result<String, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    let context = ContextManager::for_turn(
        &app,
        &pool,
        &thread_id,
        &user_message_id,
    )
        .await?;

    let api_key = credentials::resolve_api_key(app).await?;

    let client = OpenAIClient::new(api_key.to_string())
        .map_err(|_| CommandError::app("Unable to initialize API client."))?;

    let request = conversation_memory::prepare(
        &client,
        &pool,
        &context,
    )
        .await?;

    let full_text = validated_reply::generate(
        &client,
        request,
        &context.language,
        6000,
    )
        .await?;

    // Reject a reply generated against a profile that changed mid-request.
    let current_language =
        crate::chat::language_validation::thread_language(&pool, &thread_id)
            .await?;

    if crate::languages::profile(&current_language)?.locale
        != crate::languages::profile(&context.language)?.locale
    {
        return Err(CommandError::app("Your target language changed while preparing the reply. Please retry."));
    }

    on_event
        .send(StreamEvent::Chunk {
            text: full_text.clone(),
        })
        .map_err(|error| CommandError::app(error.to_string()))?;

    Ok(full_text)
}

#[tauri::command]
pub async fn send_message(
    app: tauri::AppHandle,
    databases: tauri::State<'_, tauri_plugin_sql::DbInstances>,
    thread_id: String,
    user_message_id: String,
    on_event: Channel<StreamEvent>,
) -> Result<String, CommandError> {
    crate::chat::turn_cancellations::run(
        &thread_id,
        &user_message_id,
        send_message_inner(
            app,
            databases,
            thread_id.clone(),
            user_message_id.clone(),
            on_event,
        ),
    ).await
}