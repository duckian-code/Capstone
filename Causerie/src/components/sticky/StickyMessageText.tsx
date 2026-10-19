import { useEffect, useMemo, useRef, useState } from "react";
import { useStickies } from "./StickyProvider";
import { splitStickyText } from "./sticky-matches";

interface Props {
    text: string;
}

export function StickyMessageText({ text }: Props) {
    const textRef = useRef<HTMLParagraphElement>(null);
    const [selectedText, setSelectedText] = useState("");

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
                return;
            }

            const range = selection.getRangeAt(0);

            if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
                setSelectedText("");
                return;
            }

            setSelectedText(selection.toString().trim());
        }

        document.addEventListener("selectionchange", readSelection);

        return () => {
            document.removeEventListener("selectionchange", readSelection);
        }
    }, []);

    const existing = stickies.some((sticky) => sticky.selectedText === selectedText);

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

            {selectedText && !loading && !error && (
                <div className="sticky-selection-action">
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
                        }}
                    >
                        {existing ? "Edit sticky" : "Create sticky"}
                    </button>
                </div>
            )}
        </>
    );
};