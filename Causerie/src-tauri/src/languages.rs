use crate::CommandError;

pub(crate) struct LanguageProfile {
    pub name: &'static str,
    pub code: &'static str,
    pub locale: &'static str,
    pub region: &'static str,
    pub rules: &'static str,
}

pub(crate) fn profile(language: &str) -> Result<LanguageProfile, CommandError> {
    match language.trim().to_lowercase().as_str() {
        "french" | "fr" | "français" => Ok(LanguageProfile {
            name: "French",
            code: "fr",
            locale: "fr",
            region: "France",
            rules: "Use French as used in France as the regional reference.",
        }),

        "es" | "español" | "spanish (general)" | "general spanish" => {
            Ok(LanguageProfile {
                name: "Spanish",
                code: "es",
                locale: "es",
                region: "the Spanish-speaking world",
                rules: r#"
Use broadly understandable standard written Spanish.
Do not assign the learner a specific national identity or dialect.
When regional usage matters, explain the variation.
Accept valid Spanish from different regions.
"#,
            })
        }

        // The existing app stores "Spanish" for its Caribbean option.
        // Preserve that stored value while replacing the option with Puerto Rico.
        "spanish"
        | "spanish (caribbean)"
        | "es-pr"
        | "spanish (puerto rico)"
        | "español (puerto rico)" => {
            Ok(LanguageProfile {
                name: "Spanish",
                code: "es",
                locale: "es-PR",
                region: "Puerto Rico",
                rules: r#"
DIALECT REFERENCE: Puerto Rican Spanish.

Use approachable, natural Puerto Rican Spanish.
Prefer standard written spelling and vocabulary appropriate to the context.
Use tú for ordinary informal singular address and ustedes for plural address.
Use usted when the context calls for respectful or formal address.
Do not default to vosotros or Peninsular Spanish expressions.

Avoid exaggerated slang or phonetic spellings intended to imitate an accent.
Do not assume that the learner is Puerto Rican.
Explain regional expressions when helpful.

When reviewing learner text, accept valid Spanish from other regions.
Do not mark a valid regional variant as an error solely because it differs
from the configured reference.
"#,
            })
        }

        _ => Err(CommandError::app("This language is not supported.")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn general_spanish_has_its_own_locale() {
        let language = profile("es").unwrap();

        assert_eq!(language.code, "es");
        assert_eq!(language.locale, "es");
    }

    #[test]
    fn puerto_rico_retains_the_spanish_base_language() {
        let language = profile("es-PR").unwrap();

        assert_eq!(language.code, "es");
        assert_eq!(language.locale, "es-PR");
        assert_eq!(language.region, "Puerto Rico");
    }

    #[test]
    fn existing_caribbean_selection_becomes_puerto_rico() {
        assert_eq!(profile("Spanish").unwrap().locale, "es-PR");
        assert_eq!(
            profile("Spanish (Caribbean)").unwrap().locale,
            "es-PR",
        );
    }

    #[test]
    fn french_is_preserved() {
        let language = profile("French").unwrap();

        assert_eq!(language.code, "fr");
        assert_eq!(language.locale, "fr");
    }
}