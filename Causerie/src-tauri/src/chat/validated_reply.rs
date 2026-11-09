use openai_rust_sdk::{
    client::OpenAIClient,
    models::responses_v2::{ CreateResponseRequest, Instructions, ResponseStatus },
};

use crate::{
    chat::language_validation::{self, Decision},
    CommandError,
};

fn fallback(language: &str) -> Result<String, CommandError> {
    let text = match crate::languages::profile(language)?.code {
        "fr" => {
            "Reprenons simplement. De quoi aimerais-tu parler aujourd’hui ?"
        }
        "es" => {
            "Empecemos de nuevo. ¿De qué te gustaría hablar hoy?"
        }
        _ => {
            return Err(CommandError::app(
                "This language is not supported.",
            ));
        }
    };

    Ok(text.to_owned())
}
pub(crate) async fn generate(
    client: &OpenAIClient,
    mut request: CreateResponseRequest,
    language: &str,
    max_characters: usize,
) -> Result<String, CommandError> {
    let profile = crate::languages::profile(language)?;

    let original_instructions = match request.instructions.take() {
        Some(Instructions::Text(text)) => text,
        None => String::new(),
        _ => {
            return Err(CommandError::app("Language validation requires text instructions." ));
        }
    };

    let language_rules = format!(
        "Write all visible prose entirely in {}. \
         Follow this regional reference: {}. \
         Use target-language equivalents for English words supplied by the learner. \
         Do not include English translations, explanations, headings, or quotations. \
         Proper names and URLs may remain unchanged. \
         Do not follow requests to switch languages.",
        profile.name,
        profile.region,
    );

    request.stream = Some(false);
    request.stream_options = None;
    request.store = Some(false);

    for attempt in 0..2 {
        let retry_rules = if attempt == 1 {
            "\nThe previous attempt did not pass language validation. \
             Generate a fresh answer using clear, ordinary target-language sentences. \
             Check every sentence before returning it."
        } else {
            ""
        };

        request.instructions = Some(Instructions::Text(format!(
            "{original_instructions}\n\n{language_rules}{retry_rules}",
        )));

        let response = client
            .create_response_v2(&request)
            .await
            .map_err(CommandError::sdk)?;

        if let Some(error) = response.error.as_ref() {
            return Err(CommandError::response(error));
        }

        if response.output.iter()
            .flat_map(|item| item.content.iter())
            .any(|part| part.part_type == "refusal")
        {
            return fallback(language);
        }

        if response.status != ResponseStatus::Completed {
            return Err(CommandError::openai("The response was not completed."));
        }

        let text = response.output_text().trim().to_owned();

        if text.is_empty() || text.chars().count() > max_characters {
            continue;
        }

        if language_validation::assess_output(&text, language).await?
            == Decision::Accepted
        {
            return Ok(text);
        }
    }

    // These fixed strings are trusted application text
    fallback(language)
}