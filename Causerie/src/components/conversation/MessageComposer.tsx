import { useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

interface Props {
    language: string;
    disabled: boolean;
    canCancel: boolean;
    cancelling: boolean;
    onSend: (text: string) => boolean;
    onCancel: () => Promise<string | null>;
}

// max input length.
const MAX_LENGTH = 1000;

export function MessageComposer({ language, disabled, canCancel, cancelling, onSend, onCancel }: Props) {
    const [draft, setDraft] = useState("");
    const [restoring, setRestoring] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const cancelLock = useRef(false);
    const id = useId();

    const busy = canCancel || cancelling || restoring;
    const canSend =
        !disabled &&
        !busy &&
        draft.trim().length > 0;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!canSend) return;

        // The controller trims the sent message but retains this exact draft
        if (onSend(draft)) setDraft("");
    }

    async function cancel() {
        if (!canCancel || cancelLock.current) return;

        cancelLock.current = true;
        setRestoring(true);

        try {
            const restored = await onCancel();

            if (restored !== null) {
                setDraft(restored);

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
            <label htmlFor={id}>Write in {language}</label>

            <textarea
                ref={textareaRef}
                id={id}
                value={draft}
                placeholder="What would you like to say?"
                aria-describedby={`${id}-help ${id}-count`}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                readOnly={busy}
                maxLength={MAX_LENGTH}
            />

            <div className="cw-composer-footer">
                <small id={`${id}-help`}>
                    {busy
                        ? "Cancel to return your message here for editing."
                        : "Enter to send — Shift+Enter for a new line."}
                </small>

                <small id={`${id}-count`}>
                    {draft.length}/{MAX_LENGTH}
                </small>

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