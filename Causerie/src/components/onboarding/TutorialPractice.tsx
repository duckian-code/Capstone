import { useEffect, useRef, useState } from "react";
import { useDictionary } from "../dictionary/DictionaryProvider";
import { selectedWord } from "../dictionary/selected-word";
import { useStickies } from "../sticky/StickyProvider";
import {
    useMessageHints,
    hasMultipleWords,
} from "../hints/MessageHints";
import type { ConversationMessage } from "../../data/models/conversation-types";

interface SelectionState {
    text: string;
    word: string | null;
    start: number;
    end: number;
    left: number;
    top: number;
}

interface Props {
    lesson: "translation" | "hint" | "sticky";
    message: ConversationMessage;
    initialText?: string;
    onClose: () => void;
}

export function TutorialPractice({
                                     lesson,
                                     message,
                                     initialText,
                                     onClose,
                                 }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const regionRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLQuoteElement>(null);
    const actionRef = useRef<HTMLButtonElement>(null);

    const [selection, setSelection] = useState<SelectionState | null>(
        null,
    );
    const [choosing, setChoosing] = useState(true);

    const { openWord } = useDictionary();
    const { openText } = useStickies();
    const hints = useMessageHints(message.id, message.content);

    useEffect(() => {
        if (!choosing && !hints.isOpen) {
            onClose();
        }
    }, [choosing, hints.isOpen, onClose]);

    useEffect(() => {
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;

        dialog?.showModal();

        return () => {
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
        if (!choosing) return;

        function readSelection() {
            const container = textRef.current;
            const region = regionRef.current;
            const current = window.getSelection();

            // Preserve the captured selection when the user tabs
            // from the message to its action button.
            if (document.activeElement === actionRef.current) {
                return;
            }

            if (
                !container ||
                !region ||
                !current ||
                current.isCollapsed ||
                current.rangeCount !== 1
            ) {
                setSelection(null);
                return;
            }

            const range = current.getRangeAt(0);

            if (
                !container.contains(range.startContainer) ||
                !container.contains(range.endContainer)
            ) {
                setSelection(null);
                return;
            }

            const raw = range.toString();
            const text = raw.trim();

            const bounds = Array.from(range.getClientRects()).find(
                (rect) => rect.width > 0 && rect.height > 0,
            );

            if (!text || !bounds) {
                setSelection(null);
                return;
            }

            // Use the actual selected range, rather than indexOf:
            // repeated phrases must retain their correct offsets.
            const prefix = range.cloneRange();
            prefix.selectNodeContents(container);
            prefix.setEnd(range.startContainer, range.startOffset);

            const leadingWhitespace =
                raw.length - raw.trimStart().length;
            const start = prefix.toString().length + leadingWhitespace;

            const regionBounds = region.getBoundingClientRect();
            const actionWidth = 160;

            setSelection({
                text,
                word: selectedWord(container, range),
                start,
                end: start + text.length,
                left: Math.max(
                    0,
                    Math.min(
                        bounds.left - regionBounds.left,
                        regionBounds.width - actionWidth,
                    ),
                ),
                top: Math.max(
                    0,
                    bounds.top - regionBounds.top - 44,
                ),
            });
        }

        document.addEventListener("selectionchange", readSelection);
        document.addEventListener("scroll", readSelection, true);
        window.addEventListener("resize", readSelection);

        return () => {
            document.removeEventListener(
                "selectionchange",
                readSelection,
            );
            document.removeEventListener(
                "scroll",
                readSelection,
                true,
            );
            window.removeEventListener("resize", readSelection);
        };
    }, [choosing, message.id, message.content]);

    const valid =
        selection !== null &&
        (lesson === "translation"
            ? selection.word !== null
            : lesson === "hint"
                ? hasMultipleWords(selection.text)
                : selection.text.length > 0);

    const title =
        lesson === "translation"
            ? "Click and drag to highlight a word to translate"
            : lesson === "hint"
                ? "Click and drag to highlight a phrase for a hint"
                : "Click and drag to highlight text for a sticky";

    const actionLabel =
        lesson === "translation"
            ? "Translate"
            : lesson === "hint"
                ? "Get hint"
                : "Create sticky";

    function openSelectedFeature() {
        if (!selection || !valid) return;

        const captured = selection;

        dialogRef.current?.close();
        window.getSelection()?.removeAllRanges();
        setChoosing(false);

        if (lesson === "translation" && captured.word) {
            openWord(captured.word);
            onClose();
        } else if (lesson === "sticky") {
            openText(captured.text);
            onClose();
        } else if (lesson === "hint") {
            hints.openRequest({
                selected_text: captured.text,
                start_offset: captured.start,
                end_offset: captured.end,
            });
        }
    }

    return (
        <>
            {choosing && (
                <dialog
                    ref={dialogRef}
                    className="tutorial-picker"
                    aria-labelledby="tutorial-picker-title"
                    onCancel={(event) => {
                        event.preventDefault();
                        onClose();
                    }}
                >
                    <h2 id="tutorial-picker-title">{title}</h2>

                    {lesson === "sticky" && initialText && (
                        <p>
                            Try making a note about “{initialText}”,
                            or highlight another useful phrase.
                        </p>
                    )}

                    <div
                        ref={regionRef}
                        className="tutorial-selection-region"
                    >
                        <blockquote
                            ref={textRef}
                            className="tutorial-selection-text"
                            tabIndex={0}
                            aria-label="Practice message"
                        >
                            {message.content}
                        </blockquote>

                        {selection && valid && (
                            <button
                                ref={actionRef}
                                type="button"
                                className="tutorial-selection-action"
                                style={{
                                    left: selection.left,
                                    top: selection.top,
                                }}
                                onPointerDown={(event) => {
                                    // Keep the highlight until click.
                                    event.preventDefault();
                                }}
                                onClick={openSelectedFeature}
                            >
                                {actionLabel}
                            </button>
                        )}
                    </div>

                    <label
                        className="tutorial-selection-preview"
                        htmlFor="tutorial-selected-text"
                    >
                        Selected text
                        <textarea
                            id="tutorial-selected-text"
                            readOnly
                            rows={2}
                            value={selection?.text ?? ""}
                            placeholder="Highlight text in the message above."
                        />
                    </label>

                    {selection && !valid && (
                        <p role="status">
                            {lesson === "translation"
                                ? "Highlight one complete word."
                                : "Highlight at least two words for a phrase hint."}
                        </p>
                    )}

                    <button type="button" onClick={onClose}>
                        Back to conversation
                    </button>
                </dialog>
            )}

            {hints.ui}
        </>
    );
}