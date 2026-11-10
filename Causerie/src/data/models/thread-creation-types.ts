export interface ThreadTopic {
    id: number;
    title: string;
    prompt: string;
}

export interface VoiceThreadOptions {
    voice?: boolean;
    live?: boolean;
}

export type ThreadCreationInput = VoiceThreadOptions & (
    | {
    mode: "custom";
    title: string;
    prompt: string;
}
    | {
    mode: "generated";
    topicId: number;
    requestId: string;
}
);