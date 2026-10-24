import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useStickies } from "./StickyProvider";
import { splitStickyText } from "./sticky-matches";
import { useDictionary } from "../dictionary/DictionaryProvider";
import { selectedWord } from "../dictionary/selected-word";
import { createPortal } from "react-dom";

interface Props {
    text: string;
}

export function StickyMessageText({ text }: Props) {
    const textRef = useRef<HTMLParagraphElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);
    const [anchor, setAnchor] = useState<DOMRect | null>(null);
    const [position, setPosition] = useState({ left: 0, top: 0 });

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
        function clearSelection() {
            setSelectedText("");
            setDictionaryWord(null);
            setAnchor(null);
        }

        function readSelection() {
            const container = textRef.current;
            const selection = window.getSelection();

            if (
                !container ||
                !selection ||
                selection.isCollapsed ||
                selection.rangeCount !== 1
            ) {
                clearSelection();
                return;
            }

            const range = selection.getRangeAt(0);

            if (
                !container.contains(range.startContainer) ||
                !container.contains(range.endContainer)
            ) {
                clearSelection();
                return;
            }

            // anchor above the first selected line for multiline selections
            const bounds = Array.from(range.getClientRects()).find(
                (rect) => rect.width > 0 && rect.height > 0,
            );

            setAnchor(bounds ?? null);
            setSelectedText(selection.toString().trim());
            setDictionaryWord(selectedWord(container, range));
        }

        document.addEventListener("selectionchange", readSelection);
        document.addEventListener("scroll", readSelection, true);
        window.addEventListener("resize", readSelection);

        return () => {
            document.removeEventListener("selectionchange", readSelection);
            document.removeEventListener("scroll", readSelection, true);
            window.removeEventListener("resize", readSelection);
        };
    }, []);


    const existing = stickies.some((sticky) => sticky.selected_text === selectedText);

    const showActions = Boolean(
        selectedText &&
        anchor &&
        anchor.bottom > 0 &&
        anchor.top < window.innerHeight &&
        ((!loading && !error) || dictionaryWord),
    );

    useLayoutEffect(() => {
        if (!showActions || !anchor || !actionsRef.current) return;

        const { width, height } =
            actionsRef.current.getBoundingClientRect();
        const margin = 8;

        setPosition({
            left: Math.max(
                margin,
                Math.min(
                    anchor.left + anchor.width / 2 - width / 2,
                    window.innerWidth - width - margin,
                ),
            ),
            top: Math.max(
                margin,
                Math.min(
                    anchor.top - height - margin,
                    window.innerHeight - height - margin,
                ),
            ),
        });
    }, [
        showActions,
        anchor,
        dictionaryWord,
        loading,
        error,
        existing,
    ]);

    return (
        <>
            <p ref={textRef} className="cw-message-text" tabIndex={-1}>
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

            {showActions && createPortal(
                <div
                    ref={actionsRef}
                    className="sticky-selection-action"
                    role="group"
                    aria-label="Selected text actions"
                    style={{
                        left: position.left,
                        top: position.top,
                    }}>
                    {!loading && !error && (
                        <button
                            type="button"
                            onMouseDown={(event) => {
                                // keep the selection until the click is handled
                                event.preventDefault();
                            }}
                            onClick={() => {
                                textRef.current?.focus({ preventScroll: true });
                                openText(selectedText);

                                window.getSelection()?.removeAllRanges();
                                setSelectedText("");
                                setDictionaryWord(null);
                                setAnchor(null);
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
                            onClick={() => {
                                // Return focus to the message after closing the dialog.
                                textRef.current?.focus({ preventScroll: true });
                                openWord(dictionaryWord);

                                window.getSelection()?.removeAllRanges();
                                setSelectedText("");
                                setDictionaryWord(null);
                                setAnchor(null);
                            }}
                        >
                            Translate
                        </button>
                    )}
                </div>,
                document.body,
            )}
        </>
    );
};