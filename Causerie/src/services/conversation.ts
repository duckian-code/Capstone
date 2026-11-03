import { Channel } from "@tauri-apps/api/core";
import { invoke } from "./recovery";

type StreamEvent = {
    event: "chunk";
    data: {
        text: string;
    };
};

export async function streamReply(
    threadId: string,
    userMessageId: string,
    onChunk: (text: string) => void,
): Promise<string> {
    const channel = new Channel<StreamEvent>();
    let acceptingChunks = true;

    channel.onmessage = (event) => {
        if (acceptingChunks && event.event === "chunk") {
            onChunk(event.data.text);
        }
    };

    try {
        return await invoke<string>("send_message", {
            threadId,
            userMessageId,
            onEvent: channel,
        });
    } finally {
        acceptingChunks = false;
    }
}

export function cancelReply(threadId: string, userMessageId: string): Promise<void> {
    return invoke("cancel_message", {
        threadId,
        userMessageId,
    });
}

export function discardCancelledTurn(threadId: string, userMessageId: string, assistantMessageId: string): Promise<void> {
    return invoke("discard_cancelled_turn", {
        threadId,
        userMessageId,
        assistantMessageId,
    });
}

