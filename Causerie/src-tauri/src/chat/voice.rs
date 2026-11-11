use std::time::Duration;

use base64::{engine::general_purpose::STANDARD, Engine};
use reqwest::{multipart, Client, Response};
use serde::Serialize;
use serde_json::{json, Value};
use tauri::{AppHandle, State};
use tauri_plugin_sql::DbInstances;
use unicode_normalization::UnicodeNormalization;

use crate::{ account::credentials, chat::{language_validation, validated_reply}, storage::database, CommandError };

const MAX_RECORDING_BYTES: usize = 8 * 1024 * 1024;
const MAX_RESPONSE_BYTES: usize = 16 * 1024 * 1024;

#[derive(Serialize)]
pub struct VoiceTranscript {
    pub text: String,
    pub end_session: bool,
    pub accepted: bool,
    pub message: Option<String>,
}

fn client() -> Result<Client, CommandError> {
    Client::builder()
        .connect_timeout(Duration::from_secs(10))
        .timeout(Duration::from_secs(90))
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|_| CommandError::app("Unable to initialize audio services."))
}

fn network_error(error: reqwest::Error) -> CommandError {
    if error.is_timeout() {
        CommandError::coded("request_timed_out")
    } else {
        CommandError::coded("connection_failed")
    }
}

async fn response_bytes(mut response: Response) -> Result<Vec<u8>, CommandError> {
    let status = response.status();
    let mut bytes = Vec::new();

    while let Some(chunk) = response.chunk().await.map_err(network_error)? {
        if chunk.len() > MAX_RESPONSE_BYTES.saturating_sub(bytes.len()) {
            return Err(CommandError::app("The audio response was too large."));
        }
        bytes.extend_from_slice(&chunk);
    }

    if !status.is_success() {
        let body: Value = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
        return Err(CommandError::provider(
            Some(status.as_u16()),
            body["error"]["code"].as_str(),
            body["error"]["type"].as_str(),
        ));
    }

    Ok(bytes)
}

async fn require_voice_thread(
    pool: &sqlx::SqlitePool,
    thread_id: &str,
    expected_language: &str,
) -> Result<String, CommandError> {
    let language = language_validation::thread_language(pool, thread_id).await?;

    let mode: String = sqlx::query_scalar(
        "SELECT conversation_mode FROM threads WHERE id = ?",
    )
        .bind(thread_id)
        .fetch_one(pool)
        .await
        .map_err(database::error)?;

    if mode != "voice" {
        return Err(CommandError::app("This is not a voice conversation."));
    }

    if crate::languages::profile(&language)?.locale
        != crate::languages::profile(expected_language)?.locale
    {
        return Err(CommandError::app(
            "The target language changed. Start the voice session again.",
        ));
    }

    Ok(language)
}

// Match complete commands, not words embedded in ordinary conversation
fn ends_session(text: &str) -> bool {
    let normalized: String = text
        .nfkd()
        .filter(|character| !unicode_normalization::char::is_combining_mark(*character))
        .flat_map(char::to_lowercase)
        .map(|character| if character.is_alphanumeric() { character } else { ' ' })
        .collect();

    let phrase = normalized.split_whitespace().collect::<Vec<_>>().join(" ");

    // TODO: replace this with a more graceful list management
    matches!(
        phrase.as_str(),
        "stop"
            | "stop please"
            | "end conversation"
            | "end the conversation"
            | "stop the conversation"
            | "goodbye"
            | "bye"
            | "goodbye dot"
            | "bye dot"
            | "au revoir"
            | "au revoir dot"
            | "arrete"
            | "arrete la conversation"
            | "terminer la conversation"
            | "je veux arreter"
            | "on arrete ici"
            | "adios"
            | "adios dot"
            | "hasta luego"
            | "terminar la conversacion"
            | "termina la conversacion"
            | "quiero terminar la conversacion"
            | "quiero parar"
    )
}

fn validate_wav(bytes: &[u8]) -> Result<(), CommandError> {
    // The frontend below produces this exact mono PCM WAV layout
    if bytes.len() < 44
        || bytes.len() > MAX_RECORDING_BYTES
        || &bytes[0..4] != b"RIFF"
        || &bytes[8..12] != b"WAVE"
        || &bytes[12..16] != b"fmt "
        || &bytes[36..40] != b"data"
    {
        return Err(CommandError::app("Invalid voice recording."));
    }

    let u16_at = |i| u16::from_le_bytes([bytes[i], bytes[i + 1]]);
    let u32_at = |i| u32::from_le_bytes([
        bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3],
    ]);

    let sample_rate = u32_at(24);
    let data_size = u32_at(40) as usize;

    if u32_at(16) != 16
        || u16_at(20) != 1
        || u16_at(22) != 1
        || u16_at(34) != 16
        || !(8000..=96000).contains(&sample_rate)
        || data_size != bytes.len() - 44
        || data_size % 2 != 0
        || data_size > sample_rate as usize * 2 * 65
    {
        return Err(CommandError::app("Unsupported voice recording format."));
    }

    Ok(())
}

#[tauri::command]
pub async fn transcribe_voice(
    app: AppHandle,
    databases: State<'_, DbInstances>,
    thread_id: String,
    language: String,
    audio: String,
) -> Result<VoiceTranscript, CommandError> {
    if audio.len() > (MAX_RECORDING_BYTES * 4 / 3) + 8 {
        return Err(CommandError::app("The recording is too large."));
    }

    let bytes = STANDARD.decode(audio)
        .map_err(|_| CommandError::app("Invalid recording encoding."))?;

    validate_wav(&bytes)?;

    let pool = database::pool(databases.inner()).await?;
    let current = require_voice_thread(&pool, &thread_id, &language).await?;
    let key = credentials::resolve_api_key(app).await?;

    let file = multipart::Part::bytes(bytes)
        .file_name("turn.wav")
        .mime_str("audio/wav")
        .map_err(|_| CommandError::app("Unable to prepare the recording."))?;

    // Do not force the target language. Preserve English substitutions so the existing input validator sees what the learner actually said
    let form = multipart::Form::new()
        .text("model", "gpt-transcribe")
        .text("response_format", "json")
        .part("file", file);

    let response = client()?
        .post("https://api.openai.com/v1/audio/transcriptions")
        .bearer_auth(key.as_str())
        .multipart(form)
        .send()
        .await
        .map_err(network_error)?;

    let bytes = response_bytes(response).await?;
    let body: Value = serde_json::from_slice(&bytes)
        .map_err(|_| CommandError::app("The transcription response was invalid."))?;

    let text = body["text"].as_str()
        .ok_or_else(|| CommandError::app("The transcription contained no text."))?
        .trim()
        .to_owned();

    require_voice_thread(&pool, &thread_id, &current).await?;

    // Stop commands take precedence over language validation
    if ends_session(&text) {
        return Ok(VoiceTranscript {
            text,
            end_session: true,
            accepted: true,
            message: None,
        });
    }

    if text.is_empty() {
        return Ok(VoiceTranscript {
            text,
            end_session: false,
            accepted: false,
            message: Some("No speech was recognized. Please try again.".to_owned()),
        });
    }

    if text.encode_utf16().count() > 1000 {
        return Ok(VoiceTranscript {
            text,
            end_session: false,
            accepted: false,
            message: Some("Please shorten this turn to 1,000 characters.".to_owned()),
        });
    }

    let assessment = language_validation::assess_input(&text, &current).await?;

    Ok(VoiceTranscript {
        text,
        end_session: false,
        accepted: assessment.decision != language_validation::Decision::Rejected,
        message: assessment.message,
    })
}

fn speech_chunks(text: &str) -> Vec<String> {
    let mut chunks = Vec::new();
    let mut chunk = String::new();

    for word in text.split_whitespace() {
        if !chunk.is_empty() && chunk.chars().count() + word.chars().count() + 1 > 3000 {
            chunks.push(std::mem::take(&mut chunk));
        }
        if !chunk.is_empty() {
            chunk.push(' ');
        }
        chunk.push_str(word);
    }

    if !chunk.is_empty() {
        chunks.push(chunk);
    }

    chunks
}

#[tauri::command]
pub async fn speak_message(
    app: AppHandle,
    databases: State<'_, DbInstances>,
    thread_id: String,
    message_id: String,
    language: String,
) -> Result<Vec<String>, CommandError> {
    let pool = database::pool(databases.inner()).await?;
    let current = require_voice_thread(&pool, &thread_id, &language).await?;

    // Read saved assistant text, never arbitrary text supplied by the frontend
    let text: String = sqlx::query_scalar(
        "SELECT content FROM messages
         WHERE id = ? AND thread_id = ? AND role = 'assistant'",
    )
        .bind(message_id)
        .bind(&thread_id)
        .fetch_optional(&pool)
        .await
        .map_err(database::error)?
        .ok_or_else(|| CommandError::app("The saved reply is unavailable."))?;

    if text.is_empty() || text.chars().count() > 6000 {
        return Err(CommandError::app("This reply cannot be spoken."));
    }

    let trusted_fallback = validated_reply::fallback(&current)?;
    if text != trusted_fallback
        && language_validation::assess_output(&text, &current).await?
        != language_validation::Decision::Accepted
    {
        return Err(CommandError::app("This reply did not pass language validation for speech."));
    }

    let profile = crate::languages::profile(&current)?;
    let accent = match profile.locale {
        "fr" => "French as spoken in France, with natural metropolitan French pronunciation.",
        "es-PR" => "Spanish as spoken in Puerto Rico, with natural Puerto Rican rhythm and pronunciation. Avoid caricature.",
        _ => "Broadly understandable Latin American Spanish with seseo and restrained regional pronunciation.",
    };

    let instructions = format!(
        "Read the supplied text exactly. Add no words or commentary. \
         Speak entirely in {}. Use {} \
         Sound warm, friendly, and conversational. \
         Use clear articulation and a comfortable pace for a language learner.",
        profile.name, accent,
    );

    let key = credentials::resolve_api_key(app).await?;
    let client = client()?;
    let mut audio = Vec::new();

    for chunk in speech_chunks(&text) {
        if chunk.chars().count() > 3000 {
            return Err(CommandError::app("The reply contains an unsupported long token."));
        }

        let response = client
            .post("https://api.openai.com/v1/audio/speech")
            .bearer_auth(key.as_str())
            .json(&json!({
                "model": "gpt-4o-mini-tts",
                "voice": "marin",
                "input": chunk,
                "instructions": instructions,
                "response_format": "mp3",
            }))
            .send()
            .await
            .map_err(network_error)?;

        let bytes = response_bytes(response).await?;
        if bytes.is_empty() {
            return Err(CommandError::app("Speech generation returned no audio."));
        }
        audio.push(STANDARD.encode(bytes));
    }

    require_voice_thread(&pool, &thread_id, &current).await?;
    Ok(audio)
}
