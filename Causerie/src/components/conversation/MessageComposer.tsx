import { useId, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

interface Props {
    language: string;
    disabled: boolean;
    onSend: (text: string) => boolean;
}

// max input length.
const MAX_LENGTH = 1000;

export function MessageComposer({ language, disabled, onSend }: Props) {
    const [draft, setDraft] = useState("");
    const id = useId();

    const canSend = !disabled && draft.trim().length > 0;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!canSend) return; // TODO: disable button entirely during sending state

        if (onSend(draft.trim())) setDraft("");
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        // IF AND ONLY IF ENTER IS PRESSED
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();

            if (canSend) event.currentTarget.form?.requestSubmit();
        }
    }

    return (
        <form className="cw-composer" onSubmit={submit}>
            <label htmlFor={id}>Write in {language}</label>

            <textarea
                id={id}
                value={draft}
                placeholder="What would you like to say?"
                aria-describedby={`${id}-help ${id}-count`}
                onChange={event => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={MAX_LENGTH} />

            <div className="cw-composer-footer">
                <small id={`${id}-help`}>
                    Enter to send - Shift+Enter for a new line.
                </small>

                <small id={`${id}-count`}>
                    {draft.length}/{MAX_LENGTH}
                </small>

                <button type="submit" disabled={!canSend}>{"Send"}</button>
            </div>
        </form>
    )
}