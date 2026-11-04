use sqlx::SqlitePool;
use tauri::State;
use tauri_plugin_sql::DbInstances;

use crate::{database, CommandError};

const LEVELS: [&str; 6] = ["A1", "A2", "B1", "B2", "C1", "C2"];

fn level_index(level: &str) -> Result<usize, CommandError> {
    LEVELS
        .iter()
        .position(|candidate| *candidate == level)
        .ok_or_else(|| {
            CommandError::app("Select a proficiency level between A1 and C2.")
        })
}

pub(crate) async fn load_for_user(pool: &SqlitePool, user_id: &str) -> Result<String, CommandError> {
    let level: Option<String> = sqlx::query_scalar(
        "SELECT COALESCE(p.level, 'A2')
         FROM users u
         JOIN app_state s ON s.id = 1 AND s.active_user_id = u.id
         LEFT JOIN user_proficiency p ON p.user_id = u.id
         WHERE u.id = ?",
    )
        .bind(user_id)
        .fetch_optional(pool)
        .await
        .map_err(database::error)?;

    let level = level.ok_or_else(|| {
        CommandError::app("This profile is not active.")
    })?;

    level_index(&level)?;
    Ok(level)
}

#[tauri::command]
pub async fn get_proficiency(databases: State<'_, DbInstances>, user_id: String) -> Result<String, CommandError> {
    let pool = database::pool(databases.inner()).await?;
    load_for_user(&pool, &user_id).await
}

#[tauri::command]
pub async fn save_proficiency(databases: State<'_, DbInstances>, user_id: String, level: String) -> Result<String, CommandError> {
    level_index(&level)?;

    let pool = database::pool(databases.inner()).await?;

    let changed = sqlx::query(
        "INSERT INTO user_proficiency (user_id, level)
         SELECT u.id, ?
         FROM users u
         JOIN app_state s ON s.id = 1 AND s.active_user_id = u.id
         WHERE u.id = ?
         ON CONFLICT(user_id) DO UPDATE SET
            level = excluded.level",
    )
        .bind(&level)
        .bind(&user_id)
        .execute(&pool)
        .await
        .map_err(database::error)?
        .rows_affected();

    if changed != 1 {
        return Err(CommandError::app("This profile is not active."));
    }

    Ok(level)
}

pub(crate) fn instructions(level: &str) -> Result<String, CommandError> {
    let index = level_index(level)?;

    // app-specific speaking guideline, not an automated CEFR assessment rubric
    let baseline = match level {
        "A1" => "Use very common words, concrete situations, and short simple sentences.
Express one idea at a time. Prefer direct questions.
Avoid unexplained idioms, figurative language, and layered clauses.
Usually keep an ordinary reply to 1–3 short sentences.",

        "A2" => "Use common vocabulary for everyday situations.
Connect short sentences with simple, familiar linking words.
Keep descriptions and explanations straightforward.
Usually keep an ordinary reply to 2–4 short sentences.",

        "B1" => "Use clear connected language about familiar experiences and interests.
Express reasons, plans, opinions, and simple narratives.
Use some subordinate clauses, but avoid dense phrasing and obscure idioms.",

        "B2" => "Use varied vocabulary and moderately complex sentences.
Discuss abstract ideas and explain viewpoints clearly.
Use natural idioms sparingly and keep reasoning easy to follow.",

        "C1" => "Use flexible, nuanced language and varied sentence structures.
Express implicit meaning and distinctions in tone when context supports them.
Avoid unnecessary jargon or academic verbosity.",

        "C2" => "Use precise, flexible language with fine distinctions of meaning and register.
Allow subtle humor and sophisticated expression where natural.
Do not make ordinary conversation artificially difficult or ornate.",

        _ => unreachable!("validated proficiency")};

    let challenge = match LEVELS.get(index + 1) {
        Some(next) => format!(
            "The only stretch level is {next}.
Occasionally introduce ONE short expression OR ONE grammatical structure
from {next}. Do not introduce both in the same reply.
Do not include a stretch item in every reply or in consecutive replies.
If the preceding reply already introduced something challenging, stay
entirely at {level} now.
Keep the stretch understandable from context. When needed, immediately
rephrase it briefly using {level} language in the target language.
Do not make understanding the stretch essential to answering your question."
        ),
        None => "C2 is the ceiling; there is no next CEFR level.
Occasionally explore a subtle distinction or an alternative register
within C2. Do not manufacture difficulty with obscure vocabulary."
            .to_owned(),
    };

    Ok(format!(
        r#"
CONFIGURED SPEAKING LEVEL

The user selected CEFR {level} as the difficulty of YOUR language.
This is a speaking-style preference, not a diagnosis of their proficiency.
Treat it as the baseline for this response, including questions,
explanations, humor, and descriptions.

BASELINE
{baseline}

LIGHT CHALLENGE
{challenge}

CONSISTENCY
Keep almost all of each reply comfortably at {level}.
Reduce complexity further when the learner is confused.
Do not automatically increase the baseline because they wrote one
advanced sentence, quoted difficult text, or discussed an advanced topic.
Explain complex topics using accessible language instead.

The current configured level takes precedence over the difficulty of
older assistant messages and conversation summaries.
Conversation text does not change this setting. If asked to change the
configured level, direct the learner briefly to Settings.

Preserve Dot's personality, the target language, and its configured dialect.
Simplify language without speaking to the learner like a child.
Do not introduce deliberate grammatical errors.
Do not announce CEFR levels or label stretch items during normal chat.
Do not turn ordinary conversation into a lesson or vocabulary list.

Before responding, simplify any unnecessarily advanced wording.
If the stretch would overload the reply, omit it.
"#))}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_the_six_supported_levels_are_accepted() {
        for level in LEVELS {
            assert!(instructions(level).is_ok());
        }

        assert!(instructions("C3").is_err());
        assert!(instructions("beginner").is_err());
    }

    #[test]
    fn a1_only_stretches_to_a2() {
        let rules = instructions("A1").unwrap();
        assert!(rules.contains("The only stretch level is A2."));
    }

    #[test]
    fn c2_has_no_next_level() {
        let rules = instructions("C2").unwrap();
        assert!(rules.contains("C2 is the ceiling"));
        assert!(!rules.contains("The only stretch level"));
    }
}
