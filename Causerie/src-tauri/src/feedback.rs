use std::collections::HashSet;

use openai_rust_sdk::{
    client::OpenAIClient,
    models::responses_v2::{CreateResponseRequest, ResponseStatus},
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{AppHandle, State};
use tauri_plugin_sql::DbInstances;
use openai_rust_sdk::models::gpt5::ReasoningConfig;

use crate::{
    context::{ContextManager, TeacherContext},
    corrections::SuggestedCorrection,
    credentials,
    database,
    feedback_repository::{self, StoredFeedback},
    CommandError,
};

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct FeedbackDraft {
    summary: String,
    corrections: Vec<SuggestedCorrection>,
}

#[derive(Serialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum TeacherResult {
    Ready { feedback: StoredFeedback },
    Unavailable { message: String },
}

fn schema(context: &TeacherContext) -> Value {
    let mut goal_ids: Vec<Value> = context
        .goals
        .iter()
        .map(|goal| Value::String(goal.id.clone()))
        .collect();

    goal_ids.push(Value::Null);

    json!({
        "type": "object",
        "additionalProperties": false,
        "required": ["summary", "corrections"],
        "properties": {
            "summary": { "type": "string" },
            "corrections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": false,
                    "required": [
                        "original_text",
                        "corrected_text",
                        "explanation",
                        "category",
                        "goal_id"
                    ],
                    "properties": {
                        "original_text": { "type": "string" },
                        "corrected_text": { "type": "string" },
                        "explanation": { "type": "string" },
                        "category": {
                            "type": "string",
                            "enum": [
                                "grammar", "vocabulary", "idiom",
                                "register", "clarity", "other"
                            ]
                        },
                        "goal_id": {
                            "type": ["string", "null"],
                            "enum": goal_ids
                        }
                    }
                }
            }
        }
    })
}

fn validate(draft: &FeedbackDraft, context: &TeacherContext) -> Result<(), CommandError> {
    let invalid = || {
        CommandError::openai("The teacher returned invalid feedback. Please retry.")
    };

    if draft.summary.trim().is_empty()
        || draft.summary.chars().count() > 2000
        || draft.corrections.len() > 8
    {
        return Err(invalid());
    }

    let categories = [
        "grammar", "vocabulary", "idiom",
        "register", "clarity", "other",
    ];

    let mut seen = HashSet::new();

    for correction in &draft.corrections {
        if correction.original_text.is_empty()
            || !context.content.contains(&correction.original_text)
            || correction.original_text == correction.corrected_text
            || correction.corrected_text.chars().count() > 2000
            || correction.explanation.trim().is_empty()
            || correction.explanation.chars().count() > 2000
            || !categories.contains(&correction.category.as_str())
        {
            return Err(invalid());
        }

        if let Some(id) = &correction.goal_id {
            if !context.goals.iter().any(|goal| &goal.id == id) {
                return Err(invalid());
            }
        }

        if !seen.insert((
            correction.original_text.as_str(),
            correction.corrected_text.as_str(),
        )) {
            return Err(invalid());
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn analyze_message(
    app: AppHandle,
    databases: State<'_, DbInstances>,
    thread_id: String,
    message_id: String,
) -> Result<TeacherResult, CommandError> {
    let pool = database::pool(databases.inner()).await?;

    let context = ContextManager::for_teacher(
        &app, &pool,
        &thread_id, &message_id
    ).await?;

    let mut transaction = pool.begin().await.map_err(database::error)?;
    let cached = feedback_repository::load(&mut transaction, &context).await?;
    transaction.commit().await.map_err(database::error)?;

    if let Some(feedback) = cached {
        return Ok(TeacherResult::Ready { feedback });
    }

    let Some(instructions) = context.instructions.as_deref() else {
        return Ok(TeacherResult::Unavailable {
            message: "The teacher prompt has not been configured.".to_owned(),
        });
    };

    let input = json!({
        "message": &context.content,
        "goals": &context.goals
    }).to_string();

    let api_key = credentials::resolve_api_key(app)
        .await
        .map_err(CommandError::app)?;

    let client = OpenAIClient::new(api_key.to_string())
        .map_err(|_| CommandError::app("Unable to initialize API client."))?;

    // NOTE: 4o-mini is DEV MODEL
    // let request = CreateResponseRequest::new_text("gpt-4o-mini", input)
    //     .with_instructions(instructions.to_owned())
    //     .with_strict_json_schema("teacher_feedback", schema(&context));

    let mut request = CreateResponseRequest::new_text("gpt-6.1-sol", input)
        .with_instructions(instructions.to_owned())
        .with_strict_json_schema("teacher_feedback", schema(&context));

    request.reasoning = Some(ReasoningConfig::low());

    let response = client.create_response_v2(&request).await.map_err(|error| {
        log::error!("Teacher request failed: {error}");

        CommandError::openai(
            "The teacher request failed. Please retry feedback.",
        )
    })?;

    if response.status != ResponseStatus::Completed {
        return Err(CommandError::openai(
            "The teacher response was incomplete. Please retry feedback.",
        ));
    }

    if response
        .output
        .iter()
        .flat_map(|item| item.content.iter())
        .any(|part| part.part_type == "refusal")
    {
        return Err(CommandError::openai(
            "The teacher could not provide feedback for this message.",
        ));
    }

    let draft: FeedbackDraft = serde_json::from_str(&response.output_text()).map_err(|_| {
        CommandError::openai("The teacher response could not be parsed. Please retry.")
    })?;

    validate(&draft, &context)?;

    let feedback = feedback_repository::save(
        &pool,
        &context,
        instructions,
        &draft.summary,
        &draft.corrections,
    ).await?;

    Ok(TeacherResult::Ready { feedback })
}

