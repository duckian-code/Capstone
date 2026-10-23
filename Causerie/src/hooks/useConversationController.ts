import {ConversationMessage, ConversationStatus, ConversationSummary} from "../data/models/conversation-types.ts";
import {Message} from "../data/models/dao-types.ts";
import {useEffect, useRef, useState} from "react";
import {useThreadHistory} from "./useThreadHistory.ts";
import {useMascot} from "./useMascot.ts";
import {useTypewriter} from "./useTypewriter.ts";
import {dal} from "../data/dal.ts";
import {parseCommandError} from "../services/command-error.ts";
import {streamReply} from "../services/conversation.ts";

// HANDLES CONVERSATION FLOW AND INTEGRATION WITH DAL

type Phase =
    | "idle"
    | "saving-user"
    | "streaming"
    | "saving-reply"
    | "animating"
    | "failed";

interface PendingTurn {
    threadId: string;
    user: ConversationMessage;
    assistant: ConversationMessage;
    userSaved: boolean;
    fullReply: string | null;
    replySaved: boolean;
}

function toDisplayMessage(message: Message): ConversationMessage {
    if (message.role !== "user" && message.role !== "assistant") {
        throw new Error("Invalid message role - message cannot appear in conversation.");
    }

    return {
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.created_at,
    };
}

export function useConversationController(userId: string) {
    const [threads, setThreads] = useState<ConversationSummary[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

    const [threadsLoading, setThreadsLoading] = useState(true);
    const [threadsError, setThreadsError] = useState<string | null>(null);
    const [threadRevision, setThreadRevision] = useState(0);
    const [creatingThread, setCreatingThread] = useState(false);

    const [phase, setPhase] = useState<Phase>("idle");
    const [operationError, setOperationError] = useState<string | null>(null);
    const [localMessages, setLocalMessages] =
        useState<ConversationMessage[]>([]);

    const mounted = useRef(false);
    const creatingRef = useRef(false);
    // turnRef implements synchronous retry locks via React states
    const turnRef = useRef<PendingTurn | null>(null);
    // runningRef implementation enforces synchronous retry lock. Buffer layer so you're not just relying on react state
    const runningRef = useRef(false);

    const history = useThreadHistory(activeThreadId);
    const mascot = useMascot();

    function finishTurn() {
        const turn = turnRef.current;

        if (!mounted.current || !turn?.replySaved) return;

        turnRef.current = null;
        setPhase("idle");
        setOperationError(null);

        mascot.send({ type: "STREAM_DONE" })
    }

    const typewriter = useTypewriter(40, finishTurn);

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
            turnRef.current = null;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        setThreadsLoading(true);
        setThreadsError(null);

        void dal.threads.forUser(userId).then((rows) => {
            if (cancelled) return;

            const summaries = rows.map((thread) => ({
                id: thread.id,
                title: thread.title,
                prompt: thread.topic,
                createdAt: thread.created_at,
            }));

            setThreads(summaries);
            setActiveThreadId((previous) =>
                summaries.some((thread) => thread.id === previous)
                    ? previous
                    : summaries[0]?.id ?? null,
            );
        }).catch((reason: unknown) => {
            if (!cancelled) {
                setThreadsError(parseCommandError(reason).message);
            }
        }).finally(() => {
            if (!cancelled) {
                setThreadsLoading(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [userId, threadRevision]);

    function isCurrent(turn: PendingTurn) {
        return mounted.current && turnRef.current === turn;
    }

    function putMessage(message: ConversationMessage) {
        setLocalMessages((previous) => {
            const exists = previous.some((item) => item.id === message.id);

            return exists ? previous.map((item) =>
                item.id === message.id ? message : item)
                : [...previous, message];
        });
    }

    function removeMessage(id: string) {
        setLocalMessages((previous) =>
            previous.filter((message) => message.id !== id),
        );
    }

    function moveThreadToTop(id: string) {
        setThreads((previous) => {
            const thread = previous.find((item) => item.id === id);

            return thread
                ? [thread, ...previous.filter((item) => item.id !== id)]
                : previous;
        });
    }

    async function runTurn(turn: PendingTurn) {
        if (runningRef.current) return;
        runningRef.current = true;

        // save retry already has its full response
        const willAnimate = turn.fullReply === null;

        try {
            if (!turn.userSaved) {
                setPhase("saving-user");

                const saved = await dal.messages.append(
                    turn.threadId,
                    "user",
                    turn.user.content,
                    null,
                    null,
                    turn.user.id,
                );

                if (!isCurrent(turn)) return;

                turn.userSaved = true;
                turn.user = toDisplayMessage(saved);

                putMessage(turn.user);
                moveThreadToTop(turn.threadId);
            }

            void dal.feedback.forMessage(turn.threadId, turn.user.id).catch(() => {
                // feedback panel exposes own error and retry state.
            });

            if (turn.fullReply === null) {
                typewriter.reset();
                setPhase("streaming");
                mascot.send({ type: "SUBMIT" });

                putMessage(turn.assistant);

                let started = false;

                const fullReply = await streamReply(
                    turn.threadId,
                    turn.user.id,
                    (chunk) => {
                        if (!isCurrent(turn)) return;

                        if (!started) {
                            started = true;
                            mascot.send({ type: "RESPONSE_STARTED" });
                        }

                        typewriter.append(chunk);
                    },
                );

                if (!isCurrent(turn)) return;

                turn.fullReply = fullReply;
                turn.assistant = {
                    ...turn.assistant,
                    content: fullReply,
                };

                putMessage(turn.assistant);
            }

            if (!turn.replySaved) {
                setPhase("saving-reply");

                const saved = await dal.messages.append(
                    turn.threadId,
                    "assistant",
                    turn.fullReply,
                    null,
                    null,
                    turn.assistant.id
                );

                if (!isCurrent(turn)) return;

                turn.replySaved = true;
                turn.assistant = toDisplayMessage(saved);
                putMessage(turn.assistant);
            }

            if (willAnimate) {
                setPhase("animating");
                typewriter.finish();
            } else {
                // failed save showed the complete response already
                finishTurn();
            }
        } catch (reason) {
            if (!isCurrent(turn)) return;

            typewriter.cancel();

            // partial failed stream is not full reply
            if (turn.fullReply === null) {
                removeMessage(turn.assistant.id);
            }

            setOperationError(parseCommandError(reason).message);
            setPhase("failed");

            mascot.send({
                type: turn.userSaved && turn.fullReply !== null ? "REQUEST_FAILED" : "REQUEST_CANCELLED",
            });
        } finally {
            runningRef.current = false;
        }
    }

    function sendMessage(rawText: string): boolean {
        const text = rawText.trim();

        if (
            !text ||
            // TODO: change max text length to reflect consistent program default
            text.length > 1000 ||
            !activeThreadId ||
            threadsLoading ||
            threadsError ||
            history.loading ||
            history.error ||
            creatingRef.current ||
            turnRef.current
        ) {
            return false;
        }

        const createdAt = new Date().toISOString();

        const turn: PendingTurn = {
            threadId: activeThreadId,
            user: {
                id: crypto.randomUUID(),
                role: "user",
                content: text,
                createdAt,
            },
            assistant: {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "",
                createdAt,
            },
            userSaved: false,
            fullReply: null,
            replySaved: false
        };

        // immediate lock before React rerenders
        turnRef.current = turn;

        setOperationError(null);
        putMessage(turn.user);

        void runTurn(turn);
        return true;
    }

    function retryTurn() {
        const turn = turnRef.current;

        if (!turn || phase !== "failed") return;

        // update synchronously to reject another retry click
        setPhase(turn.fullReply === null ? "saving-user" : "saving-reply");
        setOperationError(null);

        // TODO: retry-lock addition
        void runTurn(turn);
    }

    function leaveRecovery() {
        if (phase !== "failed" || runningRef.current) return;

        turnRef.current = null;
        typewriter.cancel();

        setLocalMessages([]);
        setOperationError(null);
        setPhase("idle");

        mascot.send({ type: "REQUEST_CANCELLED" });

        // reload in case write succeeded but read failed
        history.reload();
    }

    function selectThread(id: string) : boolean {
        if (
            turnRef.current ||
            creatingRef.current ||
            !threads.some((thread) => thread.id === id)
        ) return false;

        if (id === activeThreadId) return true;

        typewriter.reset();
        setLocalMessages([]);
        setOperationError(null);
        mascot.send({ type: "REQUEST_CANCELLED" });
        setActiveThreadId(id);

        return true;
    }

    async function createThread(rawTitle: string, rawPrompt: string): Promise<boolean> {
        const title = rawTitle.trim();
        const prompt = rawPrompt.trim();

        if (
            creatingRef.current ||
            turnRef.current ||
            threadsLoading ||
            threadsError ||
            !title ||
            !prompt
        ) return false;

        // lock so repeated clicks cannot create dups
        creatingRef.current = true;
        setCreatingThread(true);
        setOperationError(null);

        try {
            // TODO: revisit predefined thread
            const thread = await dal.threads.create(userId, title, prompt);

            if (!mounted.current) return false;

            setThreads((previous) => [
                {
                    id: thread.id,
                    title: thread.title,
                    prompt: thread.topic,
                    createdAt: thread.created_at,
                },
                ...previous,
            ]);

            typewriter.reset();
            setLocalMessages([]);
            mascot.send({ type: "REQUEST_CANCELLED"});
            setActiveThreadId(thread.id);

            return true;
        } catch (reason) {
            if (mounted.current) {
                setOperationError(parseCommandError(reason).message);
            }

            return false;
        } finally {
            creatingRef.current = false;
            if (mounted.current) setCreatingThread(false);
        }
    }

    const merged = new Map(
        history.messages.map((message) => [message.id, message])
    );

    for (const message of localMessages) {
        merged.set(message.id, message);
    }

    const animateId =
        phase === "streaming" ||
        phase === "saving-reply" ||
        phase === "animating" ? turnRef.current?.assistant.id : undefined;

    const messages = [...merged.values()].map((message) =>
    message.id === animateId ? { ...message, content: typewriter.displayed} : message );

    // TODO: standardize state machine and front-end states - make this redundant
    const statusByMascot = {
        idle: "idle",
        wait: "waiting",
        respond: "responding",
        error: "error",
    } satisfies Record<typeof mascot.state, ConversationStatus>;

    return {
        threads,
        activeThread: threads.find((thread) => thread.id === activeThreadId) ?? null,
        threadsLoading,
        threadsError,
        reloadThreads: () => setThreadRevision((value) => value + 1),

        creatingThread,
        createThread,
        clearCreationError: () => setOperationError(null),

        messages,
        historyLoading: history.loading,
        historyError: history.error,
        reloadHistory: history.reload,

        phase,
        operationError,
        recoveryRequired: phase === "failed",
        sendDisabled: creatingThread || phase !== "idle" || history.loading || history.error !== null,
        navigationDisabled: creatingThread || phase !== "idle",

        mascotState: mascot.state,
        status: statusByMascot[mascot.state],

        sendMessage,
        selectThread,
        retryTurn,
        leaveRecovery
    };
}