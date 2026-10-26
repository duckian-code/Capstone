import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useStickies } from "./StickyProvider";
import { splitStickyText } from "./sticky-matches";
import { useDictionary } from "../dictionary/DictionaryProvider";
import { selectedWord } from "../dictionary/selected-word";
import { createPortal } from "react-dom";
import type { HintSelection } from "../../data/dao/hint-dao";
import {
    hasMultipleWords,
    useMessageHints,
} from "../hints/MessageHints";

interface Props {
    text: string;
    messageId: string;
}

export function StickyMessageText({ text, messageId }: Props) {
    const textRef = useRef<HTMLParagraphElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);
    const [anchor, setAnchor] = useState<DOMRect | null>(null);
    const [position, setPosition] = useState({ left: 0, top: 0 });

    const [selectedText, setSelectedText] = useState("");
    const [dictionaryWord, setDictionaryWord] = useState<string | null>(null);
    const { openWord } = useDictionary();

    const { hints, openRequest, openSaved, ui: hintUI, } = useMessageHints(messageId, text);
    const [hintSelection, setHintSelection] = useState<HintSelection | null>(null);

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

    const annotatedParts = useMemo(() => {
        return parts.flatMap((part) => {
            const end = part.start + part.text.length;
            const boundaries = new Set([part.start, end]);

            for (const hint of hints) {
                if (
                    hint.start_offset < end &&
                    hint.end_offset > part.start
                ) {
                    boundaries.add(Math.max(part.start, hint.start_offset));
                    boundaries.add(Math.min(end, hint.end_offset));
                }
            }

            const sorted = [...boundaries].sort((a, b) => a - b);

            return sorted.slice(0, -1).map((start, index) => {
                const segmentEnd = sorted[index + 1];

                return {
                    start,
                    text: text.slice(start, segmentEnd),
                    sticky: part.sticky,
                    hints: hints.filter(
                        (hint) =>
                            hint.start_offset <= start &&
                            hint.end_offset >= segmentEnd,
                    ),
                };
            });
        });
    }, [parts, hints, text]);


    useEffect(() => {
        function clearSelection() {
            setSelectedText("");
            setDictionaryWord(null);
            setAnchor(null);
            setHintSelection(null);
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

            // hint section
            const raw = range.toString();
            const trimmed = raw.trim();

            const prefix = range.cloneRange();
            prefix.selectNodeContents(container);
            prefix.setEnd(range.startContainer, range.startOffset);

            const leadingWhitespace = raw.length - raw.trimStart().length;
            const start = prefix.toString().length + leadingWhitespace;

            setHintSelection(
                hasMultipleWords(trimmed)
                    ? {
                        selected_text: trimmed,
                        start_offset: start,
                        end_offset: start + trimmed.length,
                    }
                    : null,
            );
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
        ((!loading && !error) || dictionaryWord || hintSelection),
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
                {annotatedParts.map((part) => {
                    const sticky = part.sticky;
                    const hasHints = part.hints.length > 0;

                    if (!sticky && !hasHints) {
                        return <span key={part.start}>{part.text}</span>;
                    }

                    const stickyTitle = sticky?.title.trim() || "Untitled sticky";

                    const label = hasHints
                        ? `Open ${part.hints.length === 1 ? "hint" : "hints"}`
                        : `Open sticky: ${stickyTitle}`;

                    function openAnnotation() {
                        textRef.current?.focus({ preventScroll: true });

                        if (hasHints) {
                            openSaved(part.hints);
                        } else if (sticky) {
                            openSticky(sticky);
                        }
                    }

                    return (
                        <span
                            key={part.start}
                            className={[
                                sticky
                                    ? `sticky-highlight sticky-color-${sticky.color}`
                                    : "",
                                hasHints ? "hint-underline" : "",
                            ].filter(Boolean).join(" ")}
                            role="button"
                            tabIndex={0}
                            aria-label={label}
                            title={
                                hasHints && sticky
                                    ? `${label}. Select text to edit its sticky.`
                                    : label
                            }
                            onClick={() => {
                                const selection = window.getSelection();

                                if (selection && !selection.isCollapsed) return;

                                openAnnotation();
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    openAnnotation();
                                }
                            }}
                        >
            {part.text}
        </span>
                    );
                })}
            </p>

            {hintUI}

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

                    {hintSelection && (
                        <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                                textRef.current?.focus({ preventScroll: true });
                                openRequest(hintSelection);

                                window.getSelection()?.removeAllRanges();
                                setSelectedText("");
                                setDictionaryWord(null);
                                setHintSelection(null);
                                setAnchor(null);
                            }}
                        >
                            Get hint
                        </button>
                    )}
                </div>,
                document.body,
            )}
        </>
    );
};