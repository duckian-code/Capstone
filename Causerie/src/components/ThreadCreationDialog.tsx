import { useEffect, useRef, useState } from "react";
import { dal } from "../data/dal";
import type {
    ThreadCreationInput,
    ThreadTopic,
} from "../data/models/thread-creation-types";
import { parseCommandError } from "../services/command-error";

interface Props {
    creating: boolean;
    error: string | null;
    onCreate: (input: ThreadCreationInput) => Promise<boolean>;
    onClearError: () => void;
    onClose: () => void;
}

function shuffleTopics(topics: ThreadTopic[], previousId?: number): ThreadTopic[] {
    const shuffled = [...topics];

    for (let index = shuffled.length -1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
    }

    // avoid repeating final topic when starting another cycle
    if (shuffled.length > 1 && shuffled[0].id === previousId) {
        shuffled[0], shuffled[1] = shuffled[1], shuffled[0];
    }

    return shuffled;
}

export function ThreadCreationDialog({creating, error, onCreate, onClearError, onClose,}: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const submittingRef = useRef(false);
    const requestId = useRef(crypto.randomUUID());

    const [mode, setMode] = useState<"custom" | "generated">("custom");
    const [title, setTitle] = useState("");
    const [prompt, setPrompt] = useState("");

    const [topics, setTopics] = useState<ThreadTopic[]>([]);
    const [deck, setDeck] = useState<ThreadTopic[]>([]);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [topicsError, setTopicsError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);

    const selectedTopic = deck[0];

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const previousFocus = document.activeElement;
        dialog.showModal();

        return () => {
            dialog.close();

            if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        setLoadingTopics(true);
        setTopicsError(null);

        void dal.threads.topics()
            .then((items) => {
                if (cancelled) return;

                if (items.length === 0) {
                    throw new Error("No conversation topics are available.");
                }

                setTopics(items);
                setDeck(shuffleTopics(items));
            })
            .catch((cause: unknown) => {
                if (!cancelled) setTopicsError(parseCommandError(cause).message);
            })
            .finally(() => {
                if (!cancelled) setLoadingTopics(false);
            });

        return () => {
            cancelled = true;
        };
    }, [attempt]);

    function closeDialog() {
        if (!submittingRef.current && !creating) onClose();
    }

    function switchMode(next: "custom" | "generated") {
        if (submittingRef.current || creating || next === mode) return;

        setMode(next);
        requestId.current = crypto.randomUUID();
        onClearError();
    }

    function refreshTopic() {
        if (submittingRef.current || creating || topics.length < 2) return;

        setDeck((current) =>
            current.length > 1
                ? current.slice(1)
                : shuffleTopics(topics, current[0]?.id),
        );

        requestId.current = crypto.randomUUID();
        onClearError();
    }

    const valid = mode === "custom"
        ? Boolean(title.trim() && prompt.trim())
        : Boolean(selectedTopic && !loadingTopics && !topicsError);

    return (
        <dialog
            ref={dialogRef}
            className="cw-thread-dialog"
            aria-labelledby="thread-creation-title"
            aria-describedby="thread-creation-description"
            onCancel={(event) => {
                event.preventDefault();
                closeDialog();
            }}
        >
            <form
                aria-busy={creating}
                onSubmit={async (event) => {
                    event.preventDefault();

                    if (submittingRef.current || creating || !valid) return;

                    let input: ThreadCreationInput;

                    if (mode === "custom") {
                        input = { mode, title, prompt };
                    } else {
                        if (!selectedTopic) return;

                        input = {
                            mode,
                            topicId: selectedTopic.id,
                            requestId: requestId.current,
                        };
                    }

                    submittingRef.current = true;

                    try {
                        const created = await onCreate(input);

                        if (created) onClose();
                    } finally {
                        submittingRef.current = false;
                    }
                }}
            >
                <h2 id="thread-creation-title">Create a thread</h2>

                <p id="thread-creation-description">
                    Start with your own idea or discover a topic together.
                </p>

                <div
                    className="thread-mode-switch"
                    role="group"
                    aria-label="Conversation topic mode"
                >
                    <button
                        type="button"
                        autoFocus
                        aria-pressed={mode === "custom"}
                        disabled={creating}
                        onClick={() => switchMode("custom")}
                    >
                        My own topic
                    </button>

                    <button
                        type="button"
                        aria-pressed={mode === "generated"}
                        disabled={creating}
                        onClick={() => switchMode("generated")}
                    >
                        Choose for me
                    </button>
                </div>

                {mode === "custom" ? (
                    <>
                        <label htmlFor="thread-name">Thread name</label>
                        <input
                            id="thread-name"
                            name="title"
                            required
                            disabled={creating}
                            value={title}
                            placeholder="My day at school"
                            onChange={(event) => {
                                setTitle(event.target.value);
                                onClearError();
                            }}
                        />

                        <label htmlFor="thread-prompt">Thread prompt</label>
                        <textarea
                            id="thread-prompt"
                            name="prompt"
                            required
                            rows={5}
                            disabled={creating}
                            value={prompt}
                            placeholder="I had an interesting day at school today. Let's talk about it!"
                            onChange={(event) => {
                                setPrompt(event.target.value);
                                onClearError();
                            }}
                        />
                    </>
                ) : (
                    <>
                        {loadingTopics && (
                            <p role="status">Loading conversation topics…</p>
                        )}

                        {topicsError && (
                            <div>
                                <p className="cw-thread-error" role="alert">
                                    {topicsError}
                                </p>
                                <button
                                    type="button"
                                    disabled={creating}
                                    onClick={() => setAttempt((value) => value + 1)}
                                >
                                    Retry loading topics
                                </button>
                            </div>
                        )}

                        {!loadingTopics && !topicsError && selectedTopic && (
                            <>
                                <section
                                    className="thread-topic-card"
                                    aria-live="polite"
                                    aria-atomic="true"
                                    aria-labelledby="suggested-topic-title"
                                >
                                    <p className="thread-topic-label">
                                        Suggested topic
                                    </p>
                                    <h3 id="suggested-topic-title">
                                        {selectedTopic.title}
                                    </h3>
                                    <p>{selectedTopic.prompt}</p>
                                </section>

                                <button
                                    type="button"
                                    className="thread-topic-refresh"
                                    disabled={creating || topics.length < 2}
                                    onClick={refreshTopic}
                                >
                                    <span aria-hidden="true">↻</span>
                                    {" "}Try another topic
                                </button>

                                <p className="thread-creation-help">
                                    Explore {topics.length} topics. Dot will open
                                    with a fresh scenario in your learning
                                    language when you create the thread.
                                </p>
                            </>
                        )}
                    </>
                )}

                {error && (
                    <p className="cw-thread-error" role="alert">
                        {error}
                    </p>
                )}

                {creating && (
                    <p role="status" className="thread-creation-help">
                        {mode === "generated"
                            ? "Dot is setting the scene…"
                            : "Creating your thread…"}
                    </p>
                )}

                <div className="cw-thread-dialog-actions">
                    <button
                        type="button"
                        disabled={creating}
                        onClick={closeDialog}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={creating || !valid}
                    >
                        {creating
                            ? "Creating…"
                            : mode === "generated"
                                ? "Create with this topic"
                                : "Create thread"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
