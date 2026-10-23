use futures::StreamExt;
use openai_rust_sdk::{
    client::OpenAIClient,
    models::{
        responses::message_types::Message as ApiMessage,
        responses_v2::{CreateResponseRequest, ResponseStreamEvent},
        gpt5::{ ReasoningConfig, ReasoningEffort }
    },
};
use openai_rust_sdk::constants::endpoints::threads::messages;
use serde::Serialize;
use tauri::ipc::Channel;

use crate::{
    context::{ContextManager, ConversationRole},
    credentials,
    database,
    CommandError,
};

// Messages from Rust to React
#[derive(Clone, Serialize)]
#[serde(tag = "event", content = "data", rename_all = "camelCase")]
pub enum StreamEvent {
    Chunk { text: String },
}

#[tauri::command]
pub async fn send_message(
    app: tauri::AppHandle,
    databases: tauri::State<'_, tauri_plugin_sql::DbInstances>,
    thread_id: String,
    user_message_id: String,
    on_event: Channel<StreamEvent>
) -> Result<String, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    let context = ContextManager::for_turn(
        &app,
        &pool,
        &thread_id,
        &user_message_id,
    )
        .await?;

    log::debug!(
        "Prepared {} conversation messages for thread {}",
        context.messages.len(),
        context.thread_id,
    );

    let messages: Vec<ApiMessage> = context
        .messages
        .into_iter()
        .map(|message| match message.role {
            ConversationRole::User => ApiMessage::user(message.content),
            ConversationRole::Assistant => {
                ApiMessage::assistant(message.content)
            }
        })
        .collect();

    let api_key = credentials::resolve_api_key(app).await
        .map_err(CommandError::app)?;

    let client = OpenAIClient::new(api_key.to_string())
        .map_err(|_| CommandError::app("Unable to initialize API client!"))?;

    // NOTE: DEV MODEL 4o-mini
    // let request = CreateResponseRequest::new_messages(
    //     "gpt-4o-mini",
    //     messages,
    // ).with_instructions(context.system_prompt);

    let mut request = CreateResponseRequest::new_messages(
        "gpt-6-luna",
        messages
    ).with_instructions(context.system_prompt);

    request.reasoning = Some(ReasoningConfig::new(ReasoningEffort::None));

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

