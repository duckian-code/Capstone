// SQLite stores bools as 0/1. These models reflect raw DB rows.
export interface User {
    id: string; display_name: string | null; pronouns: string | null;
    native_language: string | null; target_language: string | null;
    avatar_data_url?: string | null;
}
export type UserChanges = Partial<Pick<User,
    | "display_name"
    | "pronouns"
    | "target_language"
    | "avatar_data_url"
>>;
export interface UserSettings {
    user_id: string; notifications: number; theme: string; font_size: number;
}
export interface Thread {
    id: string; user_id: string; title: string; topic: string | null;
    created_at: string; updated_at: string; archived_at: string | null;
}
export type MessageRole = 'user' | 'assistant' | 'system' | 'developer' | 'tool';
export interface Message {
    id: string; thread_id: string; role: MessageRole; content: string; sequence_no: number;
    openai_response_id: string | null; openai_item_id: string | null; created_at: string;
}
export interface MessageCorrection {
    id: string; message_id: string; original_text: string; corrected_text: string;
    explanation: string | null; start_offset: number | null; end_offset: number | null;
    category: string | null; created_at: string; goal_id: string | null; origin: "manual" | "teacher";
}
export interface Sticky {
    id: string; user_id: string; selected_text: string; title: string; user_text: string; color: StickyColor;
    created_at: string; updated_at: string;
}
export type StickyColor =
    | "red"
    | "blue"
    | "green"
    | "yellow"
    | "violet"