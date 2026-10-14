// display models separate from DAO
export type ConversationStatus =
    | "idle"
    | "waiting"
    | "responding"
    | "error";

export interface ConversationMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
    feedback?: string;
}

export interface ConversationSummary {
    id: string;
    title: string;
    createdAt: string;
}

export interface LearningContext {
    language: string;
    proficiency?: string;
    goals: string[];
}