import { invoke } from "./recovery";

export interface WordTranslation {
    word: string;
    sense: string | null;
    part_of_speech: string | null;
    tags: string[];
}

export interface EnglishLookup {
    word: string;
    target_locale: "fr" | "es" | "es-PR";
    translations: WordTranslation[];
    source_url: string;
}

export function lookupEnglishWord(word: string, language: string) {
    return invoke<EnglishLookup>("lookup_english_word", {
        word,
        language,
    });
}