export interface DictionaryMeaning {
    translation: string;
    part_of_speech: string | null;
    phrase: string | null;
    phrase_translation: string | null;
}

export interface DictionaryResult {
    word: string;
    lookup_word: string;
    source_language: string;
    translation_language: string;
    meanings: DictionaryMeaning[];
    source_url: string;
}
