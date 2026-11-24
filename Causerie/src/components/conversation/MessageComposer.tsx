import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useStoredText } from "../../hooks/useStoredText";
import { SpellingTextarea } from "./SpellingTextarea";
import { useInlineSpelling } from "../../hooks/useInlineSpelling.ts";
import { LANGUAGE_OPTIONS } from "../../data/models/onboarding-types";
import { EnglishDictionaryButton } from "../dictionary/EnglishDictionaryButton";
import { invoke } from "../../services/recovery";
import { parseCommandError } from "../../services/command-error";

interface LanguageValidation {
    decision: "accepted" | "rejected" | "uncertain";
    message: string | null;
}

interface Props {
    userId: string;
    threadId: string;
    language: string;
    disabled: boolean;
    canCancel: boolean;
    cancelling: boolean;
    onSend: (text: string) => boolean;
    onCancel: () => Promise<string | null>;
    draftKey: string;
}

// max input length.
const MAX_LENGTH = 1000;

// for replaced undo/redo functionality
interface DraftSnapshot {
    text: string;
    start: number;
    end: number;
}


export function MessageComposer({ userId, threadId, language, disabled, canCancel, cancelling, onSend, onCancel, draftKey }: Props) {
    const [draft, setDraft] = useStoredText(draftKey);
    const [restoring, setRestoring] = useState(false);

    const [checkingLanguage, setCheckingLanguage] = useState(false);
    const [languageError, setLanguageError] = useState<string | null>(null);

    const languageLock = useRef(false);
    const mounted = useRef(false);
    const latest = useRef({
        draft,
        language,
        threadId,
        disabled,
        canCancel,
        cancelling,
        onSend,
    });

    latest.current = {
        draft,
        language,
        threadId,
        disabled,
        canCancel,
        cancelling,
        onSend,
    };

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const draftHistory = useRef<{
        current: DraftSnapshot;
        undo: DraftSnapshot[];
        redo: DraftSnapshot[];
    }>({
        current: {
            text: draft,
            start: draft.length,
            end: draft.length,
        },
        undo: [],
        redo: [],
    });

    const replayingDraft = useRef(false);

    function rememberSelection() {
        const textarea = textareaRef.current;
        const current = draftHistory.current.current;

        if (!textarea || textarea.value !== current.text) return;

        current.start = textarea.selectionStart;
        current.end = textarea.selectionEnd;
    }

    function recordDraft(next: string) {
        const history = draftHistory.current;

        if (!replayingDraft.current && next !== history.current.text) {
            history.undo.push({ ...history.current });

            // Bound memory usage during long editing sessions.
            if (history.undo.length > 200) history.undo.shift();

            history.redo = [];

            const textarea = textareaRef.current;
            const matchesInput = textarea?.value === next;

            history.current = {
                text: next,
                start: matchesInput ? textarea.selectionStart : next.length,
                end: matchesInput ? textarea.selectionEnd : next.length,
            };
        }

        setDraft(next);
    }

    function resetDraftHistory(text: string) {
        draftHistory.current = {
            current: {
                text,
                start: text.length,
                end: text.length,
            },
            undo: [],
            redo: [],
        };
    }

    function moveDraftHistory(direction: "undo" | "redo") {
        rememberSelection();

        const history = draftHistory.current;
        const source = history[direction];
        const target = source.pop();

        if (!target) return;

        const destination = direction === "undo" ? history.redo : history.undo;
        destination.push({ ...history.current });

        replayingDraft.current = true;

        try {
            // Use the spelling pipeline so annotations and stored drafts
            // stay synchronized with the restored text.
            spelling.change(target.text);
            history.current = { ...target };
            setLanguageError(null);
        } finally {
            replayingDraft.current = false;
        }

        requestAnimationFrame(() => {
            const textarea = textareaRef.current;

            // Don't move the caret if another edit has happened meanwhile.
            if (!textarea || textarea.value !== target.text) return;

            textarea.setSelectionRange(target.start, target.end);
        });
    }

    const cancelLock = useRef(false);
    const id = useId();

    const spelling = useInlineSpelling({
        userId, language, text: draft, onChange: recordDraft, maxLength: MAX_LENGTH,
    });
    const busy = canCancel || cancelling || restoring;
    const canSend =
        !disabled &&
        !checkingLanguage &&
        !busy &&
        !spelling.saving &&
        draft.trim().length > 0;

    const languageLabel = LANGUAGE_OPTIONS.find(
        (option) => option.value === language || option.locale === language
    )?.label ?? language;

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!canSend || languageLock.current) return;

        const submittedDraft = draft;
        const submittedLanguage = language;
        const submittedThread = threadId;

        languageLock.current = true;
        setCheckingLanguage(true);
        setLanguageError(null);

        try {
            const result = await invoke<LanguageValidation>(
                "validate_user_language",
                {
                    threadId: submittedThread,
                    language: submittedLanguage,
                    text: submittedDraft,
                },
            );

            if (!mounted.current) return;

            const current = latest.current;

            if (
                current.draft !== submittedDraft ||
                current.language !== submittedLanguage ||
                current.threadId !== submittedThread ||
                current.disabled ||
                current.canCancel ||
                current.cancelling
            ) {
                return;
            }

            if (result.decision === "rejected") {
                setLanguageError(
                    result.message ??
                    "Try writing most of your message in the target language.",
                );
                textareaRef.current?.focus();
                return;
            }

            // Both accepted and uncertain learner messages may proceed
            if (current.onSend(submittedDraft)) {
                spelling.change("");
                resetDraftHistory("");
            }
        } catch (reason) {
            if (mounted.current) {
                setLanguageError(parseCommandError(reason).message);
            }
        } finally {
            languageLock.current = false;

            if (mounted.current) {
                setCheckingLanguage(false);
            }
        }
    }


    async function cancel() {
        if (!canCancel || cancelLock.current) return;

        cancelLock.current = true;
        setRestoring(true);

        try {
            const restored = await onCancel();

            if (restored !== null) {
                spelling.change(restored);
                resetDraftHistory(restored);

                requestAnimationFrame(() => {
                    const textarea = textareaRef.current;
                    if (!textarea) return;

                    textarea.focus();
                    textarea.setSelectionRange(
                        restored.length,
                        restored.length,
                    );
                });
            }
        } finally {
            cancelLock.current = false;
            setRestoring(false);
        }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.nativeEvent.isComposing) return;

        const key = event.key.toLowerCase();
        const modifier = event.ctrlKey || event.metaKey;

        const isUndo = modifier && !event.altKey && key === "z" && !event.shiftKey;
        const isRedo = modifier && !event.altKey && (
            (key === "z" && event.shiftKey) ||
            (key === "y" && !event.shiftKey)
        );

        if (isUndo || isRedo) {
            // Prevent the webview's separate history from also running
            event.preventDefault();
            event.stopPropagation();

            if (event.currentTarget.readOnly) return;

            moveDraftHistory(isRedo ? "redo" : "undo");
            return;
        }

        rememberSelection();

        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            // Enter never accidentally activates cancellation
            if (canSend) event.currentTarget.form?.requestSubmit();
        }
    }

    return (
        <form className="cw-composer" onSubmit={submit}>
            <div className="cw-composer-heading">
                <label htmlFor={id}>Write in {languageLabel}</label>
                <EnglishDictionaryButton
                    key={`${userId}:${language}`}
                    language={language}
                    label={languageLabel}
                />
            </div>

            <SpellingTextarea
                textareaRef={textareaRef}
                id={id}
                value={draft}
                describedBy={`${id}-help ${id}-count ${id}-spelling`}
                onChange={(text) => {
                    setLanguageError(null);
                    spelling.change(text);
                }}
                onKeyDown={handleKeyDown}
                readOnly={busy || spelling.saving || checkingLanguage}
                saving={spelling.saving}
                maxLength={MAX_LENGTH}
                issues={spelling.issues}
                onReplace={spelling.replace}
                onAdd={spelling.add}
                onSelect={rememberSelection}
            />
            <p id={`${id}-spelling`} className="spelling-status" role="status">{spelling.status}</p>
            {spelling.error && <p className="spelling-error" role="alert">{spelling.error}</p>}

            {checkingLanguage && (
                <p role="status">Checking message language…</p>
            )}

            {languageError && (
                <p className="spelling-error" role="alert">
                    {languageError}
                </p>
            )}
            <div className="cw-composer-footer">
                <small id={`${id}-help`}>
                    {busy
                        ? "Cancel to return your message here for editing."
                        : "Enter to send — Shift+Enter for a new line."}
                </small>

                <small id={`${id}-count`}>
                    {draft.length}/{MAX_LENGTH}
                </small>

                <button
                    type="button"
                    disabled={
                        disabled ||
                        busy ||
                        checkingLanguage ||
                        spelling.saving ||
                        spelling.checking ||
                        !draft.trim()
                    }
                    onClick={() => void spelling.check()}
                >
                    {spelling.checking ? "Checking…" : "Check spelling"}
                </button>

                {busy ? (
                    <button
                        key="cancel"
                        type="button"
                        disabled={cancelling || restoring || !canCancel}
                        onClick={() => void cancel()}
                    >
                        {cancelling || restoring ? "Cancelling…" : "Cancel"}
                    </button>
                ) : (
                    <button
                        key="send"
                        type="submit"
                        disabled={!canSend}>
                        {checkingLanguage ? "Checking…" : "Send"}
                    </button>
                )}
            </div>
        </form>
    );
}