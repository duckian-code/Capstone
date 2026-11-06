import { useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useStoredText } from "../../hooks/useStoredText";
import { SpellingTextarea } from "./SpellingTextarea";
import { useInlineSpelling } from "./useInlineSpelling";
import { LANGUAGE_OPTIONS } from "../../data/models/onboarding-types";
import { EnglishDictionaryButton } from "../dictionary/EnglishDictionaryButton";

interface Props {
    userId: string;
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

export function MessageComposer({ userId, language, disabled, canCancel, cancelling, onSend, onCancel, draftKey }: Props) {
    const [draft, setDraft] = useStoredText(draftKey);
    const [restoring, setRestoring] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const cancelLock = useRef(false);
    const id = useId();

    const spelling = useInlineSpelling({
        userId, language, text: draft, onChange: setDraft, maxLength: MAX_LENGTH,
    });
    const busy = canCancel || cancelling || restoring;
    const canSend =
        !disabled &&
        !busy && !spelling.saving &&
        draft.trim().length > 0;

    const languageLabel = LANGUAGE_OPTIONS.find(
        (option) => option.value === language || option.locale === language
    )?.label ?? language;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!canSend) return;

        // The controller trims the sent message but retains this exact draft
        if (onSend(draft)) spelling.change("");
    }

    async function cancel() {
        if (!canCancel || cancelLock.current) return;

        cancelLock.current = true;
        setRestoring(true);

        try {
            const restored = await onCancel();

            if (restored !== null) {
                spelling.change(restored);

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
        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
        ) {
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
                onChange={spelling.change}
                onKeyDown={handleKeyDown}
                readOnly={busy || spelling.saving}
                saving={spelling.saving}
                maxLength={MAX_LENGTH}
                issues={spelling.issues}
                onReplace={spelling.replace}
                onAdd={spelling.add}
            />
            <p id={`${id}-spelling`} className="spelling-status" role="status">{spelling.status}</p>
            {spelling.error && <p className="spelling-error" role="alert">{spelling.error}</p>}

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
                    disabled={disabled || busy || spelling.saving || spelling.checking || !draft.trim()}
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
                        disabled={!canSend}
                    >
                        Send
                    </button>
                )}
            </div>
        </form>
    );
}