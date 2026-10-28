use crate::CommandError;

pub(crate) struct LanguageProfile {
    pub name: &'static str,
    pub code: &'static str,
    pub region: &'static str,
    pub rules: &'static str,
}

pub(crate) fn profile(language: &str) -> Result<LanguageProfile, CommandError> {
    match language.trim().to_lowercase().as_str() {
        "french" | "fr" | "français" => Ok(LanguageProfile {
            name: "French",
            code: "fr",
            region: "France",
            rules: "Use French as used in France as the regional reference.",
        }),

        "spanish" | "es" | "español" | "spanish (caribbean)" => {
            Ok(LanguageProfile {
                name: "Spanish",
                code: "es",
                region: "the Spanish-speaking Caribbean",
                rules: r#"
DIALECT REFERENCE: Caribbean Spanish.

For Spanish you produce, use approachable, natural Caribbean Spanish.
This is a broad regional default, not a single national dialect.
Do not silently assign the learner a Cuban, Dominican, Puerto Rican,
or other national identity.

Prefer broadly understandable vocabulary and standard written spelling.
Use tú for ordinary informal singular address and ustedes for plural
address. Use usted when the context calls for respectful/formal address.
Do not default to vosotros or Peninsular Spanish expressions.

Avoid exaggerated slang, caricatures, and phonetic spellings intended
to imitate an accent. Do not mix country-specific slang indiscriminately.

When explaining regional usage, identify the relevant variety if known.
Do not imply that every Caribbean variety uses the same expression.
Acknowledge uncertainty rather than inventing a regional explanation.

When reviewing learner text, accept valid Spanish from other regions.
Do not mark a valid regional variant as a grammatical error merely
because it differs from this configured reference.
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
    fn spanish_uses_caribbean_reference() {
        let spanish = profile("Spanish").unwrap();

        assert_eq!(spanish.code, "es");
        assert_eq!(spanish.region, "the Spanish-speaking Caribbean");
    }

    #[test]
    fn french_keeps_its_existing_reference() {
        let french = profile("French").unwrap();

        assert_eq!(french.code, "fr");
        assert_eq!(french.region, "France");
    }
}