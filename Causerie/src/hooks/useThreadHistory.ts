import { useCallback, useEffect, useState } from "react";
import { dal } from "../data/dal";
import { parseCommandError } from "../services/command-error";
import type { ConversationMessage } from "../data/models/conversation-types";

interface HistoryState {
    threadId: string | null;
    revision: number;
    messages: ConversationMessage[];
    loading: boolean;
    error: string | null;
}

export function useThreadHistory(threadId: string | null) {
    const [revision, setRevision] = useState(0);

    const [state, setState] = useState<HistoryState>({
        threadId: null,
        revision: 0,
        messages: [],
        loading: false,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;

        setState({
            threadId,
            revision,
            messages: [],
            loading: threadId !== null,
            error: null,
        });

        if (!threadId) return;

        const requestedThreadId = threadId;

        async function load() {
            try {
                const history =
                    await dal.getThreadHistory(requestedThreadId);

                if (!history) {
                    throw new Error("Conversation no longer exists.");
                }

                const messages: ConversationMessage[] =
                    history.messages.flatMap((message) => {
                        if (
                            message.role !== "user" &&
                            message.role !== "assistant"
                        ) {
                            return [];
                        }

                        return [{
                            id: message.id,
                            role: message.role,
                            content: message.content,
                            createdAt: message.created_at,
                        }];
                    });

                if (!cancelled) {
                    setState({
                        threadId: requestedThreadId,
                        revision,
                        messages,
                        loading: false,
                        error: null,
                    });
                }
            } catch (reason) {
                if (!cancelled) {
                    setState({
                        threadId: requestedThreadId,
                        revision,
                        messages: [],
                        loading: false,
                        error: parseCommandError(reason).message,
                    });
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [threadId, revision]);

    const current =
        state.threadId === threadId &&
        state.revision === revision;

    const reload = useCallback(() => {
        setRevision((value) => value + 1);
    }, []);

    return {
        messages: current ? state.messages : [],
        loading:
            threadId !== null && (!current || state.loading),
        error: current ? state.error : null,
        reload,
    };
}