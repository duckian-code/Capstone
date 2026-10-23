import { invoke } from "@tauri-apps/api/core";
import { getDatabase } from "../database";
import type { TeacherResult } from "../models/feedback-types";

export class FeedbackDAO {
    private readonly pending = new Map<string, Promise<TeacherResult>>();

    forMessage(threadId: string, messageId: string): Promise<TeacherResult> {
        const key = JSON.stringify([threadId, messageId]);
        const existing = this.pending.get(key);

        if (existing) return existing;

        const request = (async () => {
            await getDatabase();

            return invoke<TeacherResult>("analyze_message", {
                threadId,
                messageId,
            });
        })().finally(() => {
            this.pending.delete(key);
        });

        this.pending.set(key, request);
        return request;
    }
}
