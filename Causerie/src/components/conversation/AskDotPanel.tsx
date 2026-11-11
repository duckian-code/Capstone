import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";

import { LANGUAGE_OPTIONS } from "../../data/models/onboarding-types";
import { parseCommandError } from "../../services/command-error";

interface Props {
    threadId: string;
    language: string;
    disabled?: boolean;
}

export function AskDotPanel({ threadId, language, disabled = false }: Props) {
    const inputId = useId();
    const helpId = useId();

    const mounted = useRef(false);
    const inFlight = useRef(false);

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const languageLabel = LANGUAGE_OPTIONS.find(
        (option) => option.value === language,
    )?.label ?? language;

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        };
    }, []);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const text = question.trim();
        if (!text || disabled || inFlight.current) return;

        inFlight.current = true;
        setBusy(true);
        setError(null);
        setAnswer(null);

        try {
            const result = await invoke<string>("ask_dot", {
                threadId,
                language,
                question: text,
            });

            if (mounted.current) {
                setAnswer(result);
            }
        } catch (reason: unknown) {
            if (mounted.current) {
                setError(parseCommandError(reason).message);
            }
        } finally {
            inFlight.current = false;

            if (mounted.current) {
                setBusy(false);
            }
        }
    }

    return (
        <details className="cw-ask-dot">
            <summary>
                Ask Dot anything about {languageLabel}
            </summary>

            <div className="cw-ask-dot-body">
                <p id={helpId} className="cw-muted">
                    Ask about grammar, vocabulary, pronunciation, or
                    expressions. Dot replies in {languageLabel}.
                    Each question is independent.
                </p>

                <form onSubmit={submit} aria-busy={busy}>
                    <label htmlFor={inputId}>Your question</label>

                    <textarea
                        id={inputId}
                        aria-describedby={helpId}
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        placeholder="How do I choose between these two words?"
                        rows={3}
                        maxLength={1000}
                        required
                        disabled={disabled || busy}
                    />

                    <div className="cw-ask-dot-actions">
                        <span className="cw-muted">
                            {question.length}/1000
                        </span>

                        <button
                            type="submit"
                            disabled={disabled || busy || !question.trim()}>
                            {busy ? "Asking Dot…" : "Ask Dot"}
                        </button>
                    </div>
                </form>

                {busy && <p role="status">Dot is thinking…</p>}
                {error && <p role="alert">{error}</p>}

                <div aria-live="polite" aria-atomic="true">
                    {answer !== null && (
                        <div className="cw-ask-dot-answer">
                            <strong>Dot</strong>
                            <p>{answer}</p>
                        </div>
                    )}
                </div>
            </div>
        </details>
    );
}