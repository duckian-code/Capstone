import {ConversationMessage, ConversationStatus, ConversationSummary} from "../data/models/conversation-types.ts";
import {Message} from "../data/models/dao-types.ts";
import {useEffect, useRef, useState} from "react";
import {useThreadHistory} from "./useThreadHistory.ts";
import {useMascot} from "./useMascot.ts";
import {useTypewriter} from "./useTypewriter.ts";
import {dal} from "../data/dal.ts";
import {parseCommandError} from "../services/command-error.ts";
import type { ThreadCreationInput } from "../data/models/thread-creation-types";
import { streamReply, cancelReply, discardCancelledTurn } from "../services/conversation.ts";
import { loadPendingTurn, savePendingTurn, removePendingTurn } from "../services/pending-turn";
import type { PendingTurn } from "../services/pending-turn";
import { reportIssue } from "../services/recovery";

// HANDLES CONVERSATION FLOW AND INTEGRATION WITH DAL

type Phase =
    | "idle"
    | "saving-user"
    | "streaming"
    | "saving-reply"
    | "animating"
    | "failed"
    | "cancelling"
    | "cancel-failed";


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
    const inFlightRef = useRef<Promise<void> | null>(null);
    const cancellingRef = useRef(false);

    const history = useThreadHistory(activeThreadId);
    const mascot = useMascot();

    const [changingThread, setChangingThread] = useState(false);
    const changingThreadRef = useRef(false);

    const recoveryChecked = useRef(false);


    function finishTurn() {
        const turn = turnRef.current;

        if (!mounted.current || !turn?.replySaved || turn.cancelled) return;

        try {
            removePendingTurn(userId);
        } catch (reason) {
            setOperationError(parseCommandError(reason).message);
            setPhase("failed");
            mascot.send({ type: "REQUEST_FAILED" });
            return;
        }

        turnRef.current = null;
        setPhase("idle");
        setOperationError(null);

        void dal.feedback.forMessage(turn.threadId, turn.user.id).catch(() => {
            // feedback panel exposes own error and retry state.
        });

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

            if (!recoveryChecked.current && !turnRef.current) {
                const recovered = loadPendingTurn(userId);

                if (recovered) {
                    if (!summaries.some((thread) => thread.id === recovered.threadId)) {
                        throw new Error(
                            "Saved unfinished work belongs to an unavailable thread. " +
                            "Its recovery record has been retained.",
                        );
                    }

                    turnRef.current = recovered;
                    setActiveThreadId(recovered.threadId);

                    setLocalMessages([
                        recovered.user,
                        ...(recovered.fullReply !== null
                            ? [{
                                ...recovered.assistant,
                                content: recovered.fullReply,
                            }]
                            : []),
                    ]);

                    setPhase(recovered.cancelled ? "cancel-failed" : "failed");
                    setOperationError(
                        "An unfinished conversation was restored. Retry or cancel it.",
                    );

                    reportIssue("conversation_recovery", {
                        kind: "app",
                        code: "interrupted_work",
                        message: "An unfinished conversation was restored.",
                    });

                    recoveryChecked.current = true;
                    return;
                }

                recoveryChecked.current = true;
            }

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
        return (mounted.current && turnRef.current === turn && !turn.cancelled);
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
        if (runningRef.current || !isCurrent(turn)) return;
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
                savePendingTurn(userId, turn);

                putMessage(turn.user);
                moveThreadToTop(turn.threadId);
            }

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
                // Preserve the complete reply before attempting its database save
                savePendingTurn(userId, turn);

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
                savePendingTurn(userId, turn);
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

    function startTurn(turn: PendingTurn) {
        try {
            // Save IDs and the original draft before any network or DB work
            savePendingTurn(userId, turn);
            inFlightRef.current = runTurn(turn);
        } catch (reason) {
            setOperationError(parseCommandError(reason).message);
            setPhase("failed");
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
            turnRef.current ||
            changingThreadRef.current ||
            runningRef.current ||
            cancellingRef.current
        ) {
            return false;
        }

        const createdAt = new Date().toISOString();

        const turn: PendingTurn = {
            threadId: activeThreadId,
            originalDraft: rawText,
            cancelled: false,
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

        startTurn(turn);
        return true;
    }

    async function cancelTurn(): Promise<string | null> {
        const turn = turnRef.current;

        if (!turn || cancellingRef.current) return null;

        cancellingRef.current = true;

        // sync guard: ignore late chunks and stpo next save step
        turn.cancelled = true;

        typewriter.reset();
        setPhase("cancelling");
        setOperationError(null);
        mascot.send({ type: "REQUEST_CANCELLED" });

        try {
            savePendingTurn(userId, turn);

            await cancelReply(turn.threadId, turn.user.id);

            // user/assistant INSERT may be happening, settle first before deleting messages
            await inFlightRef.current;

            await discardCancelledTurn(turn.threadId, turn.user.id, turn.assistant.id);

            removePendingTurn(userId);

            if (!mounted.current || turnRef.current !== turn) return null;

            setLocalMessages((previous) =>
                previous.filter((message) =>
                    message.id !== turn.user.id && message.id !== turn.assistant.id));

            turnRef.current = null;
            inFlightRef.current = null;

            setOperationError(null);
            setPhase("idle");
            history.reload();

            return turn.originalDraft;
        } catch (reason) {
            if (mounted.current && turnRef.current === turn) {
                setOperationError(`Cancellation could not finish: ${parseCommandError(reason).message}`);
                setPhase("cancel-failed");
            }

            return null;
        } finally {
            cancellingRef.current = false;
        }
    }

    function retryTurn() {
        const turn = turnRef.current;

        if (!turn || phase !== "failed") return;

        // update synchronously to reject another retry click
        setPhase(turn.fullReply === null ? "saving-user" : "saving-reply");
        setOperationError(null);

        // TODO: retry-lock addition
        startTurn(turn);
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

    async function createThread(input: ThreadCreationInput): Promise<boolean> {
        if (
            creatingRef.current ||
            turnRef.current ||
            threadsLoading ||
            threadsError
        ) return false;

        if ( input.mode === "custom" && (!input.title.trim() || !input.prompt.trim())) {
            return false;
        }

        // lock so repeated clicks cannot create dups
        creatingRef.current = true;
        setCreatingThread(true);
        setOperationError(null);

        try {
            // TODO: revisit predefined thread
            const thread = input.mode === "generated"
                ? await dal.threads.createGenerated(userId, input.topicId, input.requestId)
                : await dal.threads.create(userId, input.title.trim(), input.prompt.trim());

            if (!mounted.current) return false;

            setThreads((previous) => [
                {
                    id: thread.id,
                    title: thread.title,
                    prompt: thread.topic,
                    createdAt: thread.created_at,
                },
                ...previous.filter((item) => item.id !== thread.id),
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

    async function changeThread(id: string, requestedTitle: string | null): Promise<void> {
        if (
            changingThreadRef.current ||
            creatingRef.current ||
            turnRef.current ||
            threadsLoading ||
            threadsError
        ) {
            throw new Error("Finish the current operation before changing a thread.");
        }

        const thread = threads.find((item) => item.id === id);

        if (!thread) {
            throw new Error("This thread is no longer available.");
        }

        const title = requestedTitle?.trim() ?? null;

        if (title !== null && (!title || title.length > 100)) {
            throw new Error("Enter a thread name between 1 and 100 characters.");
        }

        changingThreadRef.current = true;
        setChangingThread(true);

        try {
            if (title !== null) {
                const updated = await dal.threads.rename(id, title);

                if (updated !== 1) {
                    throw new Error("The thread could not be renamed. Reload and retry.");
                }

                if (!mounted.current) return;

                // Renaming updates the backend activity timestamp.
                setThreads((previous) => {
                    const existing = previous.find((item) => item.id === id);
                    if (!existing) return previous;

                    return [
                        { ...existing, title },
                        ...previous.filter((item) => item.id !== id),
                    ];
                });
            } else {
                await dal.threads.delete(id);

                if (!mounted.current) return;

                const remaining = threads.filter((item) => item.id !== id);

                setThreads((previous) =>
                    previous.filter((item) => item.id !== id),
                );

                if (activeThreadId === id) {
                    typewriter.reset();
                    setLocalMessages([]);
                    setOperationError(null);
                    mascot.send({ type: "REQUEST_CANCELLED" });
                    setActiveThreadId(remaining[0]?.id ?? null);
                }
            }
        } finally {
            changingThreadRef.current = false;

            if (mounted.current) {
                setChangingThread(false);
            }
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

    const cancelledTurn = turnRef.current?.cancelled
        ? turnRef.current
        : null;

    const messages = [...merged.values()]
        .filter(
            (message) =>
                !cancelledTurn ||
                (
                    message.id !== cancelledTurn.user.id &&
                    message.id !== cancelledTurn.assistant.id
                ),
        )
        .map((message) =>
            message.id === animateId
                ? { ...message, content: typewriter.displayed }
                : message,
        );

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
        sendDisabled:
            creatingThread ||
            changingThread ||
            phase !== "idle" ||
            history.loading ||
            history.error !== null,

        navigationDisabled:
            creatingThread ||
            changingThread ||
            phase !== "idle",

        mascotState: mascot.state,
        status: statusByMascot[mascot.state],

        sendMessage,
        selectThread,
        retryTurn,
        leaveRecovery,

        renameThread: (id: string, title: string) => changeThread(id, title),
        deleteThread: (id: string) => changeThread(id, null),

        cancelTurn,
        canCancel: turnRef.current !== null && phase !== "cancelling",
        cancelling: phase === "cancelling",
        cancellationFailed: phase === "cancel-failed",
        pendingUserMessageId: turnRef.current?.user.id,
    };
}