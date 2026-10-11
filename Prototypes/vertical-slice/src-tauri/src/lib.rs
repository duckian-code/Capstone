use dotenv::dotenv;
use openai_api_rust::chat::{ChatApi, ChatBody};
use openai_api_rust::{Auth, Message, OpenAI, Role};
use std::env;

#[tauri::command]
async fn send_message(message: String) -> Result<String, String> {
    let message = message.trim().to_owned();

    if message.is_empty() {
        return Err("Please enter a message.".to_owned());
    }

    tauri::async_runtime::spawn_blocking(move || {
        dotenv().ok();
        let api_key = env::var("API_KEY")
            .ok()
            .filter(|key| !key.trim().is_empty())
            .ok_or_else(|| "API_KEY is not set. Add it to the project's .env file.".to_owned())?;

        let openai = OpenAI::new(Auth::new(&api_key), "https://api.openai.com/v1/");
        let request = ChatBody {
            model: "gpt-4o-mini".to_owned(),
            max_tokens: Some(256),
            temperature: Some(0.7),
            top_p: None,
            n: Some(1),
            stream: Some(false),
            stop: None,
            presence_penalty: None,
            frequency_penalty: None,
            logit_bias: None,
            user: None,
            messages: vec![Message {
                role: Role::User,
                content: message,
            }],
        };

        let response = openai
            .chat_completion_create(&request)
            .map_err(|error| format!("OpenAI request failed: {error:?}"))?;

        response
            .choices
            .first()
            .and_then(|choice| choice.message.as_ref())
            .map(|message| message.content.clone())
            .filter(|content| !content.trim().is_empty())
            .ok_or_else(|| "OpenAI returned an empty response.".to_owned())
    })
    .await
    .map_err(|error| format!("OpenAI task failed: {error}"))?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![send_message])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
