import { invoke } from "../../services/recovery";
import type { DictionaryResult } from "../models/dictionary-types";

export class DictionaryDAO {
    lookup(word: string, language: string): Promise<DictionaryResult> {
        return invoke<DictionaryResult>("lookup_dictionary", {
            word,
            language,
        });
    }
}