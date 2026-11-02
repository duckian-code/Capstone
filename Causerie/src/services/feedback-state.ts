import { callBackend } from "../data/dao/base";

export interface FeedbackStateRow {
    message_id: string;
    summary: string;
    correction_count: number;
    read_at: string | null;
}

export interface FeedbackBadge {
    available: boolean;
    unread: boolean;
}

export type FeedbackBadges = Record<string, FeedbackBadge>;

// TODO: evaluate summaries list
const EMPTY_SUMMARIES = new Set([
    "",
    "none",
    "n/a",
    "no feedback",
    "no feedback provided",
    "no feedback available",
    "no feedback provided for this message",
    "no feedback available for this message",
    "no corrections",
    "no corrections needed",
    "no corrections necessary",
    "no corrections suggested",
    "no issues found",
]);

export function hasUsefulFeedback(
    summary: string,
    correctionCount: number,
): boolean {
    if (correctionCount > 0) return true;

    const normalized = summary
        .trim()
        .toLowerCase()
        .replace(/[.!…]+$/u, "")
        .trim();

    return !EMPTY_SUMMARIES.has(normalized);
}

export const feedbackState = {
    list(threadId: string): Promise<FeedbackStateRow[]> {
        return callBackend("list_feedback_states", { threadId });
    },

    markRead(threadId: string, messageId: string): Promise<void> {
        return callBackend("mark_feedback_read", {
            threadId,
            messageId,
        });
    },
};