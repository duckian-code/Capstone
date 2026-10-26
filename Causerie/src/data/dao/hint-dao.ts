import { invoke } from "@tauri-apps/api/core";
import { getDatabase } from "../database";

export interface HintSelection {
    selected_text: string;
    start_offset: number;
    end_offset: number;
}

export interface MessageHint extends HintSelection {
    id: string;
    message_id: string;
    message_text: string;
    user_request: string | null;
    hint: string;
    created_at: string;
}

export interface HintRequest extends HintSelection {
    message_id: string;
    message_text: string;
    user_request: string | null;
}

export const hintDAO = {
    async list(messageId: string): Promise<MessageHint[]> {
        await getDatabase();

        return invoke<MessageHint[]>("list_message_hints", { messageId });
    },

    async request(request: HintRequest): Promise<MessageHint> {
        await getDatabase();

        return invoke<MessageHint>("request_message_hint", { request });
    },
}