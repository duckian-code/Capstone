import { invoke } from "@tauri-apps/api/core";

export const credentials = {
    saveApiKey(apiKey: string): Promise<void> {
        return invoke("save_openai_api_key", { apiKey });
    },
    hasApiKey(): Promise<boolean> {
        return invoke("has_openai_api_key");
    }
};