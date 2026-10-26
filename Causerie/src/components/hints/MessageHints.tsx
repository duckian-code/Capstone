import { useEffect, useRef, useState } from "react";
import {
    hintDAO,
    type HintSelection,
    type MessageHint,
} from "../../data/dao/hint-dao";
import { parseCommandError } from "../../services/command-error";
import "./hints.css";

// TODO: Language specific examples
const EXAMPLES = [
    "What is the purpose of this expression?",
    "What does this pronoun refer to?",
    "Which context clue should I look at to understand this?",
    "Why does the adjective come before the noun?",
];

type Panel =
    | { kind: "request"; selection: HintSelection }
    | { kind: "saved"; hints: MessageHint[] };

export function hasMultipleWords(text: string): boolean {
    const words = text.match(
        /[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:['’\-‐‑][\p{L}\p{N}][\p{L}\p{M}\p{N}]*)*/gu,
    );

    return (words?.length ?? 0) > 1;
}

export function useMessageHints(messageId: string, messageText: string) {
    const [hints, setHints] = useState<MessageHint[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    const [panel, setPanel] = useState<Panel | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoadError(null);

        void hintDAO.list(messageId)
            .then((items) => {
                if (!cancelled) {
                    setHints(items.filter(
                        (item) =>
                            item.message_text === messageText &&
                            messageText.slice(
                                item.start_offset,
                                item.end_offset,
                            ) === item.selected_text,
                    ));
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setLoadError(parseCommandError(error).message);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [messageId, messageText, attempt]);

    return {
        hints,
        openRequest: (selection: HintSelection) =>
            setPanel({ kind: "request", selection }),
        openSaved: (items: MessageHint[]) =>
            setPanel({ kind: "saved", hints: items }),
        ui: (
            <>
                {loadError && (
                    <div className="hint-load-error">
                        <p role="alert">
                            Could not load hints: {loadError}
                        </p>
                        <button
                            type="button"
                            onClick={() => setAttempt((value) => value + 1)}
                        >
                            Retry loading hints
                        </button>
                    </div>
                )}

                {panel && (
                    <HintDialog
                        panel={panel}
                        messageId={messageId}
                        messageText={messageText}
                        onClose={() => setPanel(null)}
                        onSaved={(hint) => {
                            setHints((current) => [
                                ...current.filter((item) => item.id !== hint.id),
                                hint,
                            ]);
                        }}
                    />
                )}
            </>
        ),
    };
}

function HintDialog({
    panel,
    messageId,
    messageText,
    onClose,
    onSaved,
}: {
    panel: Panel;
    messageId: string;
    messageText: string;
    onClose: () => void;
    onSaved: (hint: MessageHint) => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const alive = useRef(false);
    const pending = useRef(false);
    const [question, setQuestion] = useState("");
    const [example, setExample] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<MessageHint | null>(null);

    useEffect(() => {
        alive.current = true;
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;

        dialog?.showModal();

        return () => {
            alive.current = false;
            dialog?.close();

            if (
                previousFocus instanceof HTMLElement &&
                previousFocus.isConnected
            ) {
                previousFocus.focus({ preventScroll: true });
            }
        };
    }, []);

    useEffect(() => {
        if (question || busy || result || panel.kind !== "request") return;

        const timer = window.setInterval(() => {
            setExample((value) => (value + 1) % EXAMPLES.length);
        }, 5000);

        return () => window.clearInterval(timer);
    }, [question, busy, result, panel.kind]);

    async function submit() {
        if (panel.kind !== "request" || pending.current) return;

        pending.current = true;
        setBusy(true);
        setError(null);

        try {
            const hint = await hintDAO.request({
                message_id: messageId,
                message_text: messageText,
                ...panel.selection,
                user_request: question.trim() || null,
            });

            if (alive.current) {
                onSaved(hint);
                setResult(hint);
            }
        } catch (cause: unknown) {
            if (alive.current) {
                setError(parseCommandError(cause).message);
            }
        } finally {
            pending.current = false;

            if (alive.current) setBusy(false);
        }
    }

    const saved = result
        ? [result]
        : panel.kind === "saved"
            ? panel.hints
            : null;

    return (
        <dialog
            ref={dialogRef}
            className="hint-panel"
            aria-labelledby="hint-heading"
            onCancel={(event) => {
                event.preventDefault();
                if (!pending.current) onClose();
            }}
        >
            <header className="hint-toolbar">
                <h2 id="hint-heading">Phrase hint</h2>
                <button
                    type="button"
                    aria-label="Close hint"
                    disabled={busy}
                    onClick={onClose}>
                    ×
                </button>
            </header>

            {saved ? saved.map((hint) => (
                <section className="hint-result" key={hint.id}>
                    <blockquote>{hint.selected_text}</blockquote>
                    {hint.user_request && (
                        <p className="hint-question">
                            Your question: {hint.user_request}
                        </p>
                    )}
                    <p className="hint-answer">{hint.hint}</p>
                </section>
            )) : panel.kind === "request" && (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void submit();
                    }}>
                    <blockquote>
                        {panel.selection.selected_text}
                    </blockquote>

                    <label htmlFor="hint-question">
                        What are you confused about? (optional)
                    </label>
                    <textarea
                        id="hint-question"
                        autoFocus
                        rows={3}
                        maxLength={1000}
                        placeholder={EXAMPLES[example]}
                        value={question}
                        disabled={busy}
                        aria-describedby="hint-help"
                        onChange={(event) => setQuestion(event.target.value)}
                    />
                    <p id="hint-help" className="hint-help">
                        Ask about meaning, grammar, or context.
                        You’ll receive a clue to help you work it out.
                    </p>

                    {error && <p role="alert">{error}</p>}
                    {busy && (
                        <p role="status">The teacher is preparing your hint…</p>
                    )}

                    <button type="submit" disabled={busy}>
                        {busy ? "Getting hint…" : error ? "Retry hint" : "Get hint"}
                    </button>
                </form>
            )}
        </dialog>
    );
}