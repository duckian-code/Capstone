use std::{ collections::HashMap, sync::OnceLock };

use regex::Regex;
use serde::Serialize;
use spellbook::Dictionary;
use unicode_normalization::UnicodeNormalization;

use crate::CommandError;

// TODO: FIX TEXT LENGTH TO GLOBAL VARIABLE
const MAX_TEXT_LENGTH: usize = 1000;
// TODO: EVALUATE MAX_SUGGESTIONS LIMIT
const MAX_SUGGESTIONS: usize = 5;

static SPANISH: OnceLock<Result<Dictionary, String>> = OnceLock::new();
static PUERTO_RICAN: OnceLock<Result<Dictionary, String>> = OnceLock::new();
static FRENCH: OnceLock<Result<Dictionary, String>> = OnceLock::new();

#[derive(Debug, Serialize)]
pub struct SpellingIssue {
    // UTF-16 offsets match JavaScript string.slice()
    pub start: usize,
    pub end: usize,
    pub word: String,
    pub suggestions: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct SpellingResult {
    pub text: String,
    pub locale: String,
    pub issues: Vec<SpellingIssue>,
}

fn dictionary(locale: &str) -> Result<&'static Dictionary, CommandError> {
    let loaded = match locale {
        "es" => SPANISH.get_or_init(|| {
            Dictionary::new(
                include_str!("../resources/spelling/es/index.aff"),
                include_str!("../resources/spelling/es/index.dic"),
            )
                .map_err(|error| error.to_string())
        }),

        "es-PR" => PUERTO_RICAN.get_or_init(|| {
            Dictionary::new(
                include_str!("../resources/spelling/es-PR/index.aff"),
                include_str!("../resources/spelling/es-PR/index.dic"),
            )
                .map_err(|error| error.to_string())
        }),

        "fr" => FRENCH.get_or_init(|| {
            Dictionary::new(
                include_str!("../resources/spelling/fr/index.aff"),
                include_str!("../resources/spelling/fr/index.dic"),
            )
                .map_err(|error| error.to_string())
        }),

        _ => {
            return Err(CommandError::app("Spellchecking is unavailable for this locale."));
        }
    };

    loaded.as_ref().map_err(|error| {
        log::error!("Could not load bundled {locale} spelling dictionary: {error}");

        CommandError::app("The bundled spelling dictionary could not be loaded.")
    })
}

fn word_pattern() -> &'static Regex {
    static PATTERN: OnceLock<Regex> = OnceLock::new();

    PATTERN.get_or_init(|| {
        Regex::new(r"\p{L}[\p{L}\p{M}]*(?:['’\-‐‑]\p{L}[\p{L}\p{M}]*)*")
            .expect("The spelling word pattern must be valid")
    })
}

fn normalize_word(word: &str) -> String {
    word.nfc()
        .collect::<String>()
        .replace('’', "'")
        .replace(['‐', '‑'], "-")
}

fn recognizes(dictionary: &Dictionary, word: &str) -> bool {
    if dictionary.check(word) {
        return true;
    }

    // Some dictionary rules distinguish apostrophe styles
    let curly = word.replace('\'', "’");

    curly != word && dictionary.check(&curly)
}

fn suggestions(dictionary: &Dictionary, word: &str) -> Vec<String> {
    let mut output = Vec::new();
    dictionary.suggest(word, &mut output);

    if output.is_empty() {
        let curly = word.replace('\'', "’");

        if curly != word {
            dictionary.suggest(&curly, &mut output);
        }
    }

    output
}

fn check_text( text: String, locale: &str ) -> Result<SpellingResult, CommandError> {
    let primary = dictionary(locale)?;

    // Preserve acceptance of valid Spanish from other regions
    let secondary = if locale == "es-PR" {
        Some(dictionary("es")?)
    } else {
        None
    };

    // None means recognized; Some contains possible replacements
    let mut cache: HashMap<String, Option<Vec<String>>> = HashMap::new();
    let mut issues = Vec::new();

    for token in word_pattern().find_iter(&text) {
        let lookup = normalize_word(token.as_str());

        let replacements = cache.entry(lookup.clone()).or_insert_with(|| {
            let recognized = recognizes(primary, &lookup)
                || secondary.is_some_and(|dict| recognizes(dict, &lookup));

            if recognized {
                return None;
            }

            let mut candidates = suggestions(primary, &lookup);

            // Regional suggestions come first
            if candidates.len() < MAX_SUGGESTIONS {
                if let Some(dict) = secondary {
                    candidates.extend(suggestions(dict, &lookup));
                }
            }

            let mut unique = Vec::new();

            for candidate in candidates {
                if !unique.contains(&candidate) {
                    unique.push(candidate);
                }

                if unique.len() == MAX_SUGGESTIONS {
                    break;
                }
            }

            Some(unique)
        });

        if let Some(replacements) = replacements {
            issues.push(SpellingIssue {
                start: text[..token.start()].encode_utf16().count(),
                end: text[..token.end()].encode_utf16().count(),
                word: token.as_str().to_owned(),
                suggestions: replacements.clone(),
            });
        }
    }

    Ok(SpellingResult { text, locale: locale.to_owned(), issues })
}

#[tauri::command]
pub async fn check_spelling( text: String, language: String ) -> Result<SpellingResult, CommandError> {
    if text.encode_utf16().count() > MAX_TEXT_LENGTH {
        return Err(CommandError::app(format!("Spellchecking supports drafts up to :{MAX_TEXT_LENGTH} characters.")));
    }

    let locale = crate::languages::profile(&language)?.locale;

    tauri::async_runtime::spawn_blocking(move || check_text(text, locale))
        .await
        .map_err(|_| CommandError::app("Spellchecking could not finish."))?
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn all_bundled_dictionaries_load() {
        for locale in ["es", "es-PR"] {
            assert!(dictionary(locale).unwrap().check("hola"));
        }

        assert!(dictionary("fr").unwrap().check("bonjour"));
    }

    #[test]
    fn results_preserve_the_selected_locale() {
        for locale in ["es", "es-PR", "fr"] {
            let result = check_text(String::new(), locale).unwrap();
            assert_eq!(result.locale, locale);
        }
    }

    #[test]
    fn offsets_match_javascript_with_emoji_and_combining_accents() {
        let text = "🙂 e\u{301}cole qzxqzxqzx";
        let result = check_text(text.to_owned(), "fr").unwrap();

        assert!(!result.issues.iter().any(|issue| {
            issue.word == "e\u{301}cole"
        }));

        let issue = result.issues.iter()
            .find(|issue| issue.word == "qzxqzxqzx")
            .expect("The invented word should be flagged");

        let expected_start = "🙂 e\u{301}cole ".encode_utf16().count();

        assert_eq!(issue.start, expected_start);
        assert_eq!(
            issue.end,
            expected_start + "qzxqzxqzx".encode_utf16().count(),
        );
    }

    #[test]
    fn repeated_misspellings_have_separate_positions() {
        let result = check_text(
            "qzxqzxqzx qzxqzxqzx".to_owned(),
            "es-PR",
        )
            .unwrap();

        assert_eq!(result.issues.len(), 2);
        assert_ne!(result.issues[0].start, result.issues[1].start);
    }
}