use std::{sync::OnceLock, time::Duration};

use regex::Regex;
use reqwest::{Client, StatusCode, Url};
use serde::Serialize;
use serde_json::Value;
use tauri::State;
use unicode_normalization::UnicodeNormalization;

use crate::CommandError;

const MAX_RESPONSE_BYTES: usize = 2 * 1024 * 1024;

pub struct DictionaryClient {
    client: Client,
}

impl DictionaryClient {
    pub fn new() -> Result<Self, reqwest::Error> {
        Ok(Self {
            client: Client::builder()
                .connect_timeout(Duration::from_secs(5))
                .timeout(Duration::from_secs(15))
                .redirect(reqwest::redirect::Policy::none())
                .user_agent("Causerie/1.0")
                .build()?,
        })
    }
}

#[derive(Serialize)]
pub struct DictionaryMeaning {
    pub translation: String,
    pub part_of_speech: Option<String>,
    pub phrase: Option<String>,
    pub phrase_translation: Option<String>,
}

#[derive(Serialize)]
pub struct DictionaryResult {
    // Preserve what the user selected.
    pub word: String,
    // May differ after normalization or lowercase fallback.
    pub lookup_word: String,
    pub source_language: String,
    pub translation_language: String,
    pub meanings: Vec<DictionaryMeaning>,
    pub source_url: String,
}

fn word_pattern() -> &'static Regex {
    static PATTERN: OnceLock<Regex> = OnceLock::new();

    PATTERN.get_or_init(|| {
        Regex::new(r"^\p{L}[\p{L}\p{M}]*(?:['’\-‐‑]\p{L}[\p{L}\p{M}]*)*$")
            .expect("The dictionary word pattern must be valid")
    })
}

fn validate_word(raw: &str) -> Result<String, CommandError> {
    let word: String = raw.trim().nfc().collect();

    if word.chars().count() > 100 || !word_pattern().is_match(&word) {
        return Err(CommandError::app(
            "Select one word containing letters, with optional apostrophes or hyphens.",
        ));
    }

    Ok(word)
}

fn text(value: &Value) -> Option<String> {
    value.as_str()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
}

fn translated_example(example: &Value) -> Option<(String, String)> {
    let phrase = text(&example["text"])?;

    let translation = text(&example["translation"])
        .or_else(|| text(&example["english"]))?;

    Some((phrase, translation))
}

fn parse_meanings(body: &Value) -> Result<Vec<DictionaryMeaning>, CommandError> {
    let entries = body["entries"].as_array().ok_or_else(|| {
        CommandError::app("The dictionary returned an unexpected response.")
    })?;

    let mut meanings = Vec::new();

    for entry in entries {
        // The request already filters by language; also reject mismatched entries if upstream response includes them
        if entry["lang_code"]
            .as_str()
            .is_some_and(|language| language != "fr")
        {
            continue;
        }

        let Some(senses) = entry["senses"].as_array() else {
            continue;
        };

        for sense in senses {
            let Some(translation) = sense["glosses"]
                .as_array()
                .and_then(|glosses| glosses.iter().find_map(text))
            else {
                continue;
            };

            let examples = sense["examples"].as_array();

            // Prefer a translated example belonging to THIS sense.
            let translated = examples.and_then(|examples| {
                examples.iter().find_map(translated_example)
            });

            let (phrase, phrase_translation) = match translated {
                Some((phrase, translation)) => {
                    (Some(phrase), Some(translation))
                }
                None => {
                    let phrase = examples.and_then(|examples| {
                        examples.iter().find_map(|example| text(&example["text"]))
                    });

                    (phrase, None)
                }
            };

            meanings.push(DictionaryMeaning {
                translation,
                part_of_speech: text(&entry["pos"]),
                phrase,
                phrase_translation,
            });
        }
    }

    Ok(meanings)
}

fn request_error(error: reqwest::Error) -> CommandError {
    // avoid logging the URL, which contains the selected word.
    if error.is_timeout() {
        CommandError::app("The dictionary timed out. Please try again.")
    } else {
        CommandError::app("Could not reach the dictionary. Check your connection and try again.", )
    }
}

async fn fetch_meanings(client: &Client, word: &str) -> Result<Vec<DictionaryMeaning>, CommandError> {
    let mut url = Url::parse("https://api.wiktapi.dev/v1/en/word/")
        .map_err(|_| CommandError::app("Invalid dictionary configuration."))?;

    // Encode the word as a URL path segment.
    url.path_segments_mut()
        .map_err(|_| CommandError::app("Invalid dictionary configuration."))?
        .pop_if_empty()
        .push(word);

    url.query_pairs_mut().append_pair("lang", "fr");

    let mut response = client.get(url)
        .send()
        .await
        .map_err(request_error)?;

    match response.status() {
        StatusCode::NOT_FOUND => return Ok(Vec::new()),
        StatusCode::TOO_MANY_REQUESTS => {
            return Err(CommandError::app("The dictionary is busy. Wait a moment before trying again."));
        }
        status if !status.is_success() => {
            return Err(CommandError::app("The dictionary is temporarily unavailable. Please try again.", ));
        }
        _ => {}
    }

    // bound memory use even when content-length is absent
    let mut bytes = Vec::new();

    while let Some(chunk) = response.chunk().await.map_err(request_error)? {
        if chunk.len() > MAX_RESPONSE_BYTES.saturating_sub(bytes.len()) {
            return Err(CommandError::app("The dictionary response was too large."));
        }

        bytes.extend_from_slice(&chunk);
    }

    let body: Value = serde_json::from_slice(&bytes).map_err(|_| { CommandError::app("The dictionary returned an unreadable response.")})?;

    parse_meanings(&body)
}

#[tauri::command]
pub async fn lookup_dictionary(dictionary: State<'_, DictionaryClient>, word: String, language: String) -> Result<DictionaryResult, CommandError> {
    // matches the languages currently offered by onboarding and the prototype
    // TODO: ADD NEW LANGUAGES HOE
    match language.trim().to_lowercase().as_str() {
        "french" | "fr" | "français" => {}
        _ => {
            return Err(CommandError::app("Dictionary lookup currently supports French to English."));
        }
    }

    let word = validate_word(&word)?;

    let mut lookup_word = word
        .replace('’', "'")
        .replace(['‐', '‑'], "-");

    let mut meanings = fetch_meanings(&dictionary.client, &lookup_word).await?;

    // Preserve proper-name casing first; try lowercase only when not found.
    let lowercase = lookup_word.to_lowercase();

    if meanings.is_empty() && lowercase != lookup_word {
        lookup_word = lowercase;
        meanings = fetch_meanings(&dictionary.client, &lookup_word).await?;
    }

    let mut source_url = Url::parse("https://en.wiktionary.org/wiki/")
        .map_err(|_| CommandError::app("Invalid dictionary configuration."))?;

    source_url.path_segments_mut()
        .map_err(|_| CommandError::app("Invalid dictionary configuration."))?
        .pop_if_empty()
        .push(&lookup_word);

    source_url.set_fragment(Some("French"));

    Ok(DictionaryResult {
        word,
        lookup_word,
        source_language: "fr".to_owned(),
        translation_language: "en".to_owned(),
        meanings,
        source_url: source_url.to_string(),
    })
}