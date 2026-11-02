import { useCallback, useEffect, useRef, useState } from "react";
import {
    feedbackState,
    hasUsefulFeedback,
} from "../services/feedback-state";
import type { FeedbackBadges } from "../services/feedback-state";
import { parseCommandError } from "../services/command-error";

export function useFeedbackBadges(threadId: string) {
    const sequence = useRef(0);
    const activeThread = useRef<string | null>(null);

    const [snapshot, setSnapshot] = useState<{ threadId: string; badges: FeedbackBadges; } | null>(null);

    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        const request = ++sequence.current;

        try {
            const rows = await feedbackState.list(threadId);

            if (
                activeThread.current !== threadId ||
                request !== sequence.current
            ) return;

            const badges: FeedbackBadges = {};

            for (const row of rows) {
                const available = hasUsefulFeedback(
                    row.summary,
                    row.correction_count,
                );

                badges[row.message_id] = {
                    available,
                    unread: available && row.read_at === null,
                };
            }

            setSnapshot({ threadId, badges });
            setError(null);
        } catch (reason) {
            if (
                activeThread.current === threadId &&
                request === sequence.current
            ) {
                setError(parseCommandError(reason).message);
            }
        }
    }, [threadId]);

    useEffect(() => {
        activeThread.current = threadId;
        setError(null);

        let stopped = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        async function poll() {
            if (document.visibilityState !== "hidden") {
                await refresh();
            }

            if (!stopped) {
                timer = setTimeout(() => void poll(), 3000);
            }
        }

        void poll();

        return () => {
            stopped = true;
            clearTimeout(timer);
            activeThread.current = null;
            sequence.current++;
        };
    }, [threadId, refresh]);

    const markRead = useCallback((messageId: string) => {
        void feedbackState.markRead(threadId, messageId).then(() => {
            if (activeThread.current !== threadId) return;

            // Ignore older list requests that captured the unread state.
            sequence.current++;

            setSnapshot((previous) => {
                if (previous?.threadId !== threadId) return previous;

                const badge = previous.badges[messageId];
                if (!badge) return previous;

                return {
                    ...previous,
                    badges: {
                        ...previous.badges,
                        [messageId]: { ...badge, unread: false },
                    },
                };
            });

            setError(null);
        }).catch((reason: unknown) => {
            if (activeThread.current === threadId) {
                setError(parseCommandError(reason).message);
            }
        });
    }, [threadId]);

    return {
        badges: snapshot?.threadId === threadId
            ? snapshot.badges
            : {},
        error,
        refresh,
        markRead,
    };
}