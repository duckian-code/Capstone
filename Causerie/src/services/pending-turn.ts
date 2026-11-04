import type { ConversationMessage } from "../data/models/conversation-types";
import { clearIssue, reportIssue } from "./recovery";

export interface PendingTurn {
    threadId: string;
    user: ConversationMessage;
    assistant: ConversationMessage;
    userSaved: boolean;
    fullReply: string | null;
    replySaved: boolean;
    originalDraft: string;
    cancelled: boolean;
}

function storageKey(userId: string) {
    return `causerie:pending-turn:v1:${userId}`;
}

function fail(): never {
    const error = {
        kind: "app" as const,
        code: "storage_failure",
        message: "Unfinished work could not be saved or restored locally.",
    };

    reportIssue("pending_turn_storage", error);
    throw error;
}

function isMessage(
    value: unknown,
    role: "user" | "assistant",
): value is ConversationMessage {
    if (!value || typeof value !== "object") return false;

    const message = value as Record<string, unknown>;

    return (
        typeof message.id === "string" &&
        message.role === role &&
        typeof message.content === "string" &&
        typeof message.createdAt === "string"
    );
}

export function loadPendingTurn(userId: string): PendingTurn | null {
    try {
        const raw = localStorage.getItem(storageKey(userId));
        if (!raw) return null;

        const turn: unknown = JSON.parse(raw);
        if (!turn || typeof turn !== "object") return fail();

        const value = turn as Record<string, unknown>;

        if (
            typeof value.threadId !== "string" ||
            !isMessage(value.user, "user") ||
            !isMessage(value.assistant, "assistant") ||
            value.user.id === value.assistant.id ||
            typeof value.originalDraft !== "string" ||
            typeof value.userSaved !== "boolean" ||
            typeof value.replySaved !== "boolean" ||
            typeof value.cancelled !== "boolean" ||
            !(
                value.fullReply === null ||
                typeof value.fullReply === "string"
            ) ||
            (value.replySaved && value.fullReply === null)
        ) {
            return fail();
        }

        return value as unknown as PendingTurn;
    } catch {
        return fail();
    }
}

export function savePendingTurn(userId: string, turn: PendingTurn) {
    try {
        localStorage.setItem(storageKey(userId), JSON.stringify(turn));
        clearIssue("pending_turn_storage");
    } catch {
        fail();
    }
}

export function removePendingTurn(userId: string) {
    try {
        localStorage.removeItem(storageKey(userId));
        clearIssue("pending_turn_storage");
        clearIssue("conversation_recovery");
    } catch {
        fail();
    }
}