import { callBackend } from "../data/dao/base";

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
    userId: string,
    text: string,
    language: string,
): Promise<SpellingResult> {
    return callBackend<SpellingResult>("check_spelling", {
        userId,
        text,
        language,
    });
}