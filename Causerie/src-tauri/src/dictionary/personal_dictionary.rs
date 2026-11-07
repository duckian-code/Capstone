use std::{collections::HashSet, sync::OnceLock};

use regex::Regex;
use serde::Serialize;
use sqlx::{FromRow, QueryBuilder, Sqlite, SqlitePool};
use tauri::State;
use tauri_plugin_sql::DbInstances;
use unicode_normalization::UnicodeNormalization;

use crate::{storage::database, CommandError};
use crate::storage::database::error as db_error;

const PAGE_SIZE: usize = 50;

#[derive(Debug, Serialize, FromRow)]
pub struct PersonalWord {
    pub word_key: String,
    pub word: String,
}

#[derive(Serialize)]
pub struct PersonalPage {
    pub entries: Vec<PersonalWord>,
    pub has_more: bool,
}

pub(crate) fn key(word: &str) -> String {
    word.nfc().collect::<String>()
        .replace('’', "'")
        .replace(['‐', '‑'], "-")
        .to_lowercase().nfc().collect()
}

fn validate_word(raw: &str) -> Result<String, CommandError> {
    static PATTERN: OnceLock<Regex> = OnceLock::new();
    let pattern = PATTERN.get_or_init(|| {
        Regex::new(r"^\p{L}[\p{L}\p{M}]*(?:['’\-‐‑]\p{L}[\p{L}\p{M}]*)*$")
            .expect("Valid personal dictionary pattern")
    });
    let word: String = raw.trim().nfc().collect();
    if word.chars().count() > 100 || !pattern.is_match(&word) {
        return Err(CommandError::app("Enter one word, up to 100 letters, with optional apostrophes or hyphens."));
    }
    Ok(word)
}

pub(crate) async fn require_active_user(
    pool: &SqlitePool,
    user_id: &str,
) -> Result<(), CommandError> {
    let active: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM app_state WHERE id = 1 AND active_user_id = ?)",
    ).bind(user_id).fetch_one(pool).await.map_err(db_error)?;
    if !active {
        return Err(CommandError::app("This profile is no longer active."));
    }
    Ok(())
}

// Only retrieve keys present in this draft. No full dictionary load or stale cache
pub(crate) async fn matching_keys(
    pool: &SqlitePool,
    user_id: &str,
    language: &str,
    keys: &HashSet<String>,
) -> Result<HashSet<String>, CommandError> {
    let keys: Vec<&String> = keys.iter().collect();
    let mut found = HashSet::new();
    for chunk in keys.chunks(400) {
        let mut query = QueryBuilder::<Sqlite>::new(
            "SELECT word_key FROM personal_dictionary WHERE user_id = ",
        );
        query.push_bind(user_id).push(" AND language = ").push_bind(language);
        query.push(" AND word_key IN (");
        {
            let mut values = query.separated(", ");
            for word in chunk { values.push_bind(*word); }
        }
        query.push(")");
        let rows = query.build_query_scalar::<String>()
            .fetch_all(pool).await.map_err(db_error)?;
        found.extend(rows);
    }
    Ok(found)
}

#[tauri::command]
pub async fn list_personal_words(
    databases: State<'_, DbInstances>,
    user_id: String,
    language: String,
    after: Option<String>,
    prefix: String,
) -> Result<PersonalPage, CommandError> {
    let language = crate::languages::profile(&language)?.code;
    let pool = database::pool(databases.inner()).await?;
    require_active_user(&pool, &user_id).await?;
    if prefix.chars().count() > 100 || after.as_ref().is_some_and(|s| s.len() > 1000) {
        return Err(CommandError::app("The dictionary search is too long."));
    }
    let prefix = key(prefix.trim());
    let upper = format!("{prefix}\u{10ffff}");
    let mut entries = sqlx::query_as::<_, PersonalWord>(
        "SELECT word_key, word FROM personal_dictionary
         WHERE user_id = ? AND language = ?
           AND word_key >= ? AND word_key < ? AND word_key > ?
         ORDER BY word_key LIMIT ?",
    )
        .bind(user_id).bind(language).bind(prefix).bind(upper)
        .bind(after.unwrap_or_default()).bind((PAGE_SIZE + 1) as i64)
        .fetch_all(&pool).await.map_err(db_error)?;
    let has_more = entries.len() > PAGE_SIZE;
    entries.truncate(PAGE_SIZE);
    Ok(PersonalPage { entries, has_more })
}

#[tauri::command]
pub async fn add_personal_word(
    databases: State<'_, DbInstances>,
    user_id: String,
    language: String,
    word: String,
) -> Result<PersonalWord, CommandError> {
    let language = crate::languages::profile(&language)?.code;
    let word = validate_word(&word)?;
    let word_key = key(&word);
    let pool = database::pool(databases.inner()).await?;
    require_active_user(&pool, &user_id).await?;
    sqlx::query_as::<_, PersonalWord>(
        "INSERT INTO personal_dictionary (user_id, language, word_key, word)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id, language, word_key) DO UPDATE SET word = excluded.word
         RETURNING word_key, word",
    )
        .bind(user_id).bind(language).bind(word_key).bind(word)
        .fetch_one(&pool).await.map_err(db_error)
}

#[tauri::command]
pub async fn remove_personal_word(
    databases: State<'_, DbInstances>,
    user_id: String,
    language: String,
    word_key: String,
) -> Result<(), CommandError> {
    let language = crate::languages::profile(&language)?.code;
    if word_key.len() > 1000 {
        return Err(CommandError::app("Invalid dictionary entry."));
    }
    let pool = database::pool(databases.inner()).await?;
    require_active_user(&pool, &user_id).await?;
    sqlx::query(
        "DELETE FROM personal_dictionary WHERE user_id = ? AND language = ? AND word_key = ?",
    ).bind(user_id).bind(language).bind(word_key)
        .execute(&pool).await.map_err(db_error)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn personal_keys_normalize_case_and_typography_but_keep_accents() {
        assert_eq!(key("ÉCOLE"), key("e\u{301}cole"));
        assert_eq!(key("L’école"), key("l'école"));
        assert_ne!(key("sí"), key("si"));
        assert_ne!(key("año"), key("ano"));
    }

    #[test]
    fn entries_are_words_not_hunspell_flags_or_phrases() {
        assert!(validate_word("l'école").is_ok());
        assert!(validate_word("word/FLAGS").is_err());
        assert!(validate_word("two words").is_err());
        assert!(validate_word("").is_err());
    }
}