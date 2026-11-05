import { callBackend } from "../data/dao/base";

export interface PersonalWord { word_key: string; word: string }
export interface PersonalPage { entries: PersonalWord[]; has_more: boolean }
export const PERSONAL_DICTIONARY_CHANGED = "causerie:personal-dictionary-changed";

export function personalKey(word: string): string {
    return word.normalize("NFC").replace(/’/g, "'")
        .replace(/[‐‑]/g, "-").toLowerCase().normalize("NFC");
}

function changed(userId: string) {
    window.dispatchEvent(new CustomEvent(PERSONAL_DICTIONARY_CHANGED, {
        detail: { userId },
    }));
}

export const personalDictionary = {
    list(userId: string, language: string, after: string | null, prefix = "") {
        return callBackend<PersonalPage>("list_personal_words", {
            userId, language, after, prefix,
        });
    },
    async add(userId: string, language: string, word: string) {
        const entry = await callBackend<PersonalWord>("add_personal_word", {
            userId, language, word,
        });
        changed(userId);
        return entry;
    },
    async remove(userId: string, language: string, wordKey: string) {
        await callBackend<void>("remove_personal_word", {
            userId, language, wordKey,
        });
        changed(userId);
    },
};