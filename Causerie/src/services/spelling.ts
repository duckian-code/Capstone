import { invoke } from "./recovery";

export type SpellingLocale = "es" | "es-PR" | "fr";

export interface SpellingIssue {
    start: number;
    end: number;
    word: string;
    suggestions: string[];
}

export interface SpellingResult {
    text: string;
    locale: SpellingLocale;
    issues: SpellingIssue[];
}

export function checkSpelling(
    text: string,
    language: string,
): Promise<SpellingResult> {
    return invoke<SpellingResult>("check_spelling", {
        text,
        language,
    });
}