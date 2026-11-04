import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useStickies } from "./StickyProvider";
import { AnnotationChooser } from "./AnnotationChooser";
import type { AnnotationChoice } from "./AnnotationChooser";
import { useDictionary } from "../dictionary/DictionaryProvider";
import { selectedWord } from "../dictionary/selected-word";
import { createPortal } from "react-dom";
import type { HintSelection } from "../../data/dao/hint-dao";
import { hasMultipleWords, useMessageHints } from "../hints/MessageHints";
import type { Sticky } from "../../data/models/dao-types";
import { stickyCategoryLabel } from "../../data/models/sticky-categories";

interface Props {
    text: string;
    messageId: string;
}

function stickyHoverText(sticky: Sticky): string {
    const title = sticky.title.trim() || "Untitled sticky";

    const categories = sticky.categories.length > 0
        ? sticky.categories.map(stickyCategoryLabel).join(", ")
        : "No categories";

    return `${title}\nCategories: ${categories}`;
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

    const [chooser, setChooser] = useState<AnnotationChoice[] | null>(null);

    const {
        stickies,
        loading,
        error,
        openText,
        openSticky,
    } = useStickies();

    const annotatedParts = useMemo(() => {
        // Find every sticky occurrence, including overlapping occurrences
        const stickyMatches = stickies
            .filter((sticky) => sticky.selected_text.length > 0)
            .flatMap((sticky) => {
                const matches: {
                    start: number;
                    end: number;
                    sticky: typeof sticky;
                }[] = [];

                let from = 0;

                while (from < text.length) {
                    const start = text.indexOf(sticky.selected_text, from);
                    if (start === -1) break;

                    matches.push({
                        start,
                        end: start + sticky.selected_text.length,
                        sticky,
                    });

                    from = start + 1;
                }

                return matches;
            });

        const messageHints = hints.filter(
            (hint) =>
                hint.message_id === messageId &&
                hint.message_text === text &&
                hint.start_offset >= 0 &&
                hint.end_offset > hint.start_offset &&
                hint.end_offset <= text.length &&
                text.slice(hint.start_offset, hint.end_offset) ===
                hint.selected_text,
        );

        const boundaries = new Set<number>([0, text.length]);

        for (const match of stickyMatches) {
            boundaries.add(match.start);
            boundaries.add(match.end);
        }

        for (const hint of messageHints) {
            boundaries.add(hint.start_offset);
            boundaries.add(hint.end_offset);
        }

        const sorted = [...boundaries].sort((a, b) => a - b);

        return sorted.slice(0, -1).map((start, index) => {
            const end = sorted[index + 1];

            const coveringStickies = stickyMatches
                .filter((match) => match.start <= start && match.end >= end)
                .map((match) => match.sticky);

            // A sticky may overlap itself... show it only once in the chooser
            const uniqueStickies = [
                ...new Map(
                    coveringStickies.map((sticky) => [sticky.id, sticky]),
                ).values(),
            ].sort(
                (a, b) =>
                    b.selected_text.length - a.selected_text.length ||
                    a.id.localeCompare(b.id),
            );

            return {
                start,
                text: text.slice(start, end),
                stickies: uniqueStickies,
                hints: messageHints.filter(
                    (hint) =>
                        hint.start_offset <= start &&
                        hint.end_offset >= end,
                ),
            };
        });
    }, [text, messageId, stickies, hints]);

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
                    const sticky = part.stickies[0];
                    const hasHints = part.hints.length > 0;

                    if (!sticky && !hasHints) {
                        return <span key={part.start}>{part.text}</span>;
                    }

                    const choices: AnnotationChoice[] = [
                        ...part.stickies.map((item): AnnotationChoice => ({
                            id: `sticky:${item.id}`,
                            kind: "Sticky",
                            phrase: item.selected_text,
                            preview: [
                                item.title.trim(),
                                item.user_text.trim(),
                            ].filter(Boolean).join(" — ") || "Open saved sticky",
                            open: () => openSticky(item),
                        })),

                        ...part.hints.map((hint): AnnotationChoice => ({
                            id: `hint:${hint.id}`,
                            kind: "Hint",
                            phrase: hint.selected_text,
                            preview: hint.user_request?.trim() ||
                                hint.hint.trim() ||
                                "Open saved hint",
                            open: () => openSaved([hint]),
                        })),
                    ];

                    const multiple = choices.length > 1;

                    const label = multiple
                        ? `Choose annotation: ${choices.length} available`
                        : choices[0].kind === "Sticky"
                            ? `Open sticky: ${sticky?.title.trim() || "Untitled sticky"}`
                            : "Open hint";

                    const hoverText = part.stickies.length > 0
                        ? [
                            ...part.stickies.map(stickyHoverText),
                            ...(hasHints ? ["Saved hint also available"] : []),
                        ].join("\n\n")
                        : label;

                    function openAnnotation() {
                        textRef.current?.focus({ preventScroll: true });

                        if (multiple) {
                            setChooser(choices);
                        } else {
                            choices[0].open();
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
                            aria-label={
                                part.stickies.length > 0
                                    ? `${label}. ${hoverText}`
                                    : label
                            }
                            aria-haspopup="dialog"
                            title={hoverText}
                            onClick={() => {
                                const selection = window.getSelection();

                                // Dragging to select text must not open an annotation.
                                if (selection && !selection.isCollapsed) return;

                                openAnnotation();
                            }}
                            onKeyDown={(event) => {
                                if (
                                    event.key !== "Enter" &&
                                    event.key !== " "
                                ) return;

                                const selection = window.getSelection();
                                if (selection && !selection.isCollapsed) return;

                                event.preventDefault();
                                openAnnotation();
                            }}
                        >
            {part.text}
        </span>
                    );
                })}
            </p>

            {chooser && (
                <AnnotationChooser
                    choices={chooser}
                    onDismiss={() => setChooser(null)}
                    onChoose={(choice) => {
                        setChooser(null);
                        choice.open();
                    }}
                />
            )}

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