import { invoke } from "@tauri-apps/api/core";
import type { DictionaryResult } from "../models/dictionary-types";

export class DictionaryDAO {
    lookup(word: string, language: string): Promise<DictionaryResult> {
        return invoke<DictionaryResult>("lookup_dictionary", {
            word,
            language,
        });
    }
}