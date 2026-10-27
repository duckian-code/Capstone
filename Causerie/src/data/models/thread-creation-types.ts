export interface ThreadTopic {
    id: number;
    title: string;
    prompt: string;
}

export type ThreadCreationInput =
    | {
    mode: "custom";
    title: string;
    prompt: string;
}
    | {
    mode: "generated";
    topicId: number;
    requestId: string;
};