import { callBackend } from "./base";
import type { Message, MessageRole } from "../models/dao-types";

export class MessageDAO {
    get(id: string): Promise<Message | null> {
        return callBackend("get_message", { id });
    }

    forThread(threadId: string): Promise<Message[]> {
        return callBackend("list_messages", { threadId });
    }

    append(
        threadId: string,
        role: MessageRole,
        content: string,
        responseId: string | null = null,
        itemId: string | null = null,
        id?: string,
    ): Promise<Message> {
        return callBackend("append_message", {
            threadId,
            role,
            content,
            responseId,
            itemId,
            id: id ?? null,
        });
    }

    delete(id: string): Promise<number> {
        return callBackend("delete_message", { id });
    }
}