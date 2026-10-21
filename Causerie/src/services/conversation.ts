import {Channel, invoke} from "@tauri-apps/api/core";

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