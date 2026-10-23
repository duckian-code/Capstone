import { useEffect, useMemo, useRef, useState } from "react";
import { useStickies } from "./StickyProvider";
import { splitStickyText } from "./sticky-matches";
import { useDictionary } from "../dictionary/DictionaryProvider";
import { selectedWord } from "../dictionary/selected-word";

interface Props {
    text: string;
}

export function StickyMessageText({ text }: Props) {
    const textRef = useRef<HTMLParagraphElement>(null);
    const [selectedText, setSelectedText] = useState("");
    const [dictionaryWord, setDictionaryWord] = useState<string | null>(null);
    const { openWord } = useDictionary();

    const {
        stickies,
        loading,
        error,
        openText,
        openSticky,
    } = useStickies();

    const parts = useMemo(
        () => splitStickyText(text, stickies),
        [text, stickies],
    );

    useEffect(() => {
        function readSelection() {
            const container = textRef.current;
            const selection = window.getSelection();

            if (!container || !selection || selection.isCollapsed || selection.rangeCount !== 1) {
                setSelectedText("");
                setDictionaryWord(null);
                return;
            }

            const range = selection.getRangeAt(0);

            if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
                setSelectedText("");
                return;
            }

            setSelectedText(selection.toString().trim());
            setDictionaryWord(selectedWord(container, range));
        }

        document.addEventListener("selectionchange", readSelection);

        return () => {
            document.removeEventListener("selectionchange", readSelection);
        }
    }, []);

    const existing = stickies.some((sticky) => sticky.selected_text === selectedText);

    return (
        <>
            <p ref={textRef} className="cw-message-text">
                {parts.map((part) => {
                    const sticky = part.sticky;

                    if (!sticky) {
                        return (
                            <span key={part.start}>
                                {part.text}
                            </span>
                        );
                    }

                    // Display fallback only; never saved as the title.
                    const title =
                        sticky.title.trim() || "Untitled sticky";

                    return (
                        <span
                            key={`${part.start}-${sticky.id}`}
                            className={
                                `sticky-highlight ` +
                                `sticky-color-${sticky.color}`
                            }
                            role="button"
                            tabIndex={0}
                            title={title}
                            aria-label={`Open sticky: ${title}`}
                            onClick={() => {
                                const selection =
                                    window.getSelection();

                                // Dragging across highlighted text
                                // should select it, not open the editor.
                                if (
                                    selection &&
                                    !selection.isCollapsed
                                ) {
                                    return;
                                }

                                openSticky(sticky);
                            }}
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    event.preventDefault();
                                    openSticky(sticky);
                                }
                            }}
                        >
                            {part.text}
                        </span>
                    );
                })}
            </p>

            {selectedText && (
                <div className="sticky-selection-action">
                    {!loading && !error && (
                        <button
                            type="button"
                            onMouseDown={(event) => {
                                // Preserve the selection while clicking.
                                event.preventDefault();
                            }}
                            onClick={() => {
                                openText(selectedText);
                                window.getSelection()?.removeAllRanges();
                                setSelectedText("");
                                setDictionaryWord(null);
                            }}
                        >
                            {existing ? "Edit sticky" : "Create sticky"}
                        </button>
                    )}
                    {dictionaryWord && (
                        <button
                            type="button"
                            className="dictionary-selection-button"
                            aria-label={`Translate ${dictionaryWord}`}
                            onMouseDown={(event) => {
                                event.preventDefault();
                            }}
                            onClick={(event) => {
                                // Establish a focus-return target before opening the dialog.
                                event.currentTarget.focus();

                                openWord(dictionaryWord);
                            }}
                        >
                            Translate
                        </button>
                    )}
                </div>
            )}
        </>
    );
};