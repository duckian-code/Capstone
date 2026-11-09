use std::sync::OnceLock;

use lingua::{Language, LanguageDetector, LanguageDetectorBuilder};
use regex::Regex;
use serde::Serialize;
use sqlx::SqlitePool;
use tauri::State;
use tauri_plugin_sql::DbInstances;
use unicode_normalization::UnicodeNormalization;

use crate::{storage::database, CommandError};

const MIN_INPUT_WORDS: usize = 4;
const MIN_CONFIDENCE: f64 = 0.70;
const MIN_MARGIN: f64 = 0.15;
const MIN_KNOWN_COVERAGE: f64 = 0.60;
const INPUT_TARGET_SHARE: f64 = 2.0 / 3.0;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum Decision {
    Accepted,
    Rejected,
    Uncertain,
}

#[derive(Serialize)]
pub(crate) struct InputValidation {
    pub decision: Decision,
    pub message: Option<String>,
}

fn detector() -> &'static LanguageDetector {
    static DETECTOR: OnceLock<LanguageDetector> = OnceLock::new();

    DETECTOR.get_or_init(|| {
        LanguageDetectorBuilder::from_languages(&[
            Language::English,
            Language::French,
            Language::Spanish,
        ])
            .build()
    })
}

fn words() -> &'static Regex {
    static WORDS: OnceLock<Regex> = OnceLock::new();

    WORDS.get_or_init(|| {
        Regex::new(r"\p{L}[\p{L}\p{M}]*(?:['’\-]\p{L}[\p{L}\p{M}]*)*")
            .expect("Valid language-validation word pattern")
    })
}

fn clean(raw: &str) -> String {
    static URLS: OnceLock<Regex> = OnceLock::new();

    let urls = URLS.get_or_init(|| {
        Regex::new(r"(?i)\b(?:https?://|www\.)\S+")
            .expect("Valid URL pattern")
    });

    let normalized: String = raw.nfc().collect();
    urls.replace_all(&normalized, " ").into_owned()
}

fn word_count(text: &str) -> usize {
    words().find_iter(text).count()
}

fn target_language(language: &str) -> Result<Language, CommandError> {
    match crate::languages::profile(language)?.code {
        "fr" => Ok(Language::French),
        "es" => Ok(Language::Spanish),
        _ => Err(CommandError::app("This language is not supported.")),
    }
}

// Confidence is a relative detector score, not a percentage of words.
fn confident_language(text: &str) -> Option<Language> {
    if word_count(text) == 0 {
        return None;
    }

    let scores = detector().compute_language_confidence_values(text);
    let &(best_language, best_score) = scores.first()?;
    let next_score = scores.get(1).map(|item| item.1).unwrap_or(0.0);

    if best_score >= MIN_CONFIDENCE
        && best_score - next_score >= MIN_MARGIN
    {
        Some(best_language)
    } else {
        None
    }
}

fn input_decision(raw: &str, target: Language) -> Decision {
    let text = clean(raw);
    let total = word_count(&text);

    if total < MIN_INPUT_WORDS {
        return Decision::Uncertain;
    }

    let mut target_words = 0;
    let mut other_words = 0;

    for span in detector().detect_multiple_languages_of(&text) {
        let fragment = &text[span.start_index()..span.end_index()];
        let count = word_count(fragment);

        // Isolated words may be names, borrowed words, or misspellings.
        if count < 3 {
            continue;
        }

        match confident_language(fragment) {
            Some(language) if language == target => target_words += count,
            Some(_) => other_words += count,
            None => {}
        }
    }

    let known = target_words + other_words;

    if known == 0
        || (known as f64 / total as f64) < MIN_KNOWN_COVERAGE
    {
        return Decision::Uncertain;
    }

    // Unknown words are not automatically classified as another language.
    let estimated_share = target_words as f64 / known as f64;

    if estimated_share >= INPUT_TARGET_SHARE {
        Decision::Accepted
    } else if other_words as f64 / total as f64 > 1.0 - INPUT_TARGET_SHARE {
        Decision::Rejected
    } else {
        Decision::Uncertain
    }
}

fn output_decision(raw: &str, target: Language) -> Decision {
    let text = clean(raw);

    match confident_language(&text) {
        Some(language) if language != target => return Decision::Rejected,
        None => return Decision::Uncertain,
        _ => {}
    }

    // A target-language majority must not hide a foreign-language span.
    for span in detector().detect_multiple_languages_of(&text) {
        let fragment = &text[span.start_index()..span.end_index()];

        if confident_language(fragment).is_some_and(|language| language != target) {
            return Decision::Rejected;
        }
    }

    // Also check sentences independently, including newline-separated prose.
    for sentence in text.split(['.', '!', '?', '\n', ';']) {
        if word_count(sentence) == 0 {
            continue;
        }

        match confident_language(sentence) {
            Some(language) if language != target => return Decision::Rejected,
            None if word_count(sentence) >= 4 => return Decision::Uncertain,
            _ => {}
        }
    }

    Decision::Accepted
}

async fn assess(
    text: &str,
    language: &str,
    output: bool,
) -> Result<Decision, CommandError> {
    let target = target_language(language)?;
    let text = text.to_owned();

    tauri::async_runtime::spawn_blocking(move || {
        if output {
            output_decision(&text, target)
        } else {
            input_decision(&text, target)
        }
    })
        .await
        .map_err(|_| CommandError::app("Language validation could not finish."))
}

pub(crate) async fn assess_output(
    text: &str,
    language: &str,
) -> Result<Decision, CommandError> {
    assess(text, language, true).await
}

pub(crate) async fn assess_input(
    text: &str,
    language: &str,
) -> Result<InputValidation, CommandError> {
    if text.trim().is_empty() {
        return Err(CommandError::app("Please enter a message."));
    }

    // Match JavaScript's UTF-16 length limit.
    if text.encode_utf16().count() > 1000 {
        return Err(CommandError::app("Keep your message within 1,000 characters."));
    }

    let decision = assess(text, language, false).await?;
    let profile = crate::languages::profile(language)?;

    let message = (decision == Decision::Rejected).then(|| {
        format!(
            "Try writing most of your message in {}. You can still use \
             English for words you haven't learned yet.",
            profile.name,
        )
    });

    Ok(InputValidation { decision, message })
}

pub(crate) async fn require_input(
    text: &str,
    language: &str,
) -> Result<(), CommandError> {
    let result = assess_input(text, language).await?;

    if result.decision == Decision::Rejected {
        return Err(CommandError {
            kind: "app",
            code: "input_language",
            message: result.message.unwrap_or_else(|| {
                "Try writing most of your message in the target language.".to_owned()
            }),
        });
    }

    Ok(())
}

pub(crate) async fn thread_language(
    pool: &SqlitePool,
    thread_id: &str,
) -> Result<String, CommandError> {
    sqlx::query_scalar::<_, String>(
        "SELECT COALESCE(NULLIF(TRIM(u.target_language), ''), 'French')
         FROM threads t
         JOIN users u ON u.id = t.user_id
         JOIN app_state s ON s.id = 1 AND s.active_user_id = u.id
         WHERE t.id = ? AND t.archived_at IS NULL",
    )
        .bind(thread_id)
        .fetch_optional(pool)
        .await
        .map_err(database::error)?
        .ok_or_else(|| {
            CommandError::app("This conversation is unavailable for the active profile.")
        })
}

#[tauri::command]
pub async fn validate_user_language(
    databases: State<'_, DbInstances>,
    thread_id: String,
    language: String,
    text: String,
) -> Result<InputValidation, CommandError> {
    let pool = database::pool(databases.inner()).await?;
    let current = thread_language(&pool, &thread_id).await?;

    if crate::languages::profile(&current)?.locale
        != crate::languages::profile(&language)?.locale
    {
        return Err(CommandError::app(
            "Your target language changed. Reopen this conversation before sending.",
        ));
    }

    assess_input(&text, &current).await
}