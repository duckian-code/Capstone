import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";
import { createPortal } from "react-dom";
import type { SpellingIssue } from "../../services/spelling";
import "./spelling.css";

interface Props {
    textareaRef: RefObject<HTMLTextAreaElement | null>;
    id: string;
    value: string;
    describedBy: string;
    readOnly: boolean;
    saving: boolean;
    maxLength: number;
    issues: SpellingIssue[];
    onChange: (value: string) => void;
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
    onReplace: (issue: SpellingIssue, suggestion: string) => void;
    onAdd: (issue: SpellingIssue) => Promise<boolean>;
}
interface OpenWord { issue: SpellingIssue; rect: DOMRect }

export function SpellingTextarea(props: Props) {
    const mirror = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState<OpenWord | null>(null);
    function syncMirror() {
        const textarea = props.textareaRef.current;
        const layer = mirror.current;
        if (!textarea || !layer) return;
        layer.style.width = `${textarea.clientWidth}px`;
        layer.style.height = `${textarea.clientHeight}px`;
        layer.scrollTop = textarea.scrollTop;
        layer.scrollLeft = textarea.scrollLeft;
    }
    useLayoutEffect(() => {
        const textarea = props.textareaRef.current;
        if (!textarea) return;
        syncMirror();
        const observer = new ResizeObserver(syncMirror);
        observer.observe(textarea);
        return () => observer.disconnect();
    }, [props.textareaRef]);
    useLayoutEffect(syncMirror, [props.value, props.issues]);
    useEffect(() => { setOpen(null); }, [props.value]);
    useEffect(() => {
        if (props.readOnly && !props.saving) setOpen(null);
        else if (open && !props.issues.some((issue) =>
            issue.start === open.issue.start && issue.word === open.issue.word,
        )) setOpen(null);
    }, [props.issues, props.readOnly, props.saving, open]);

    function openAtCaret() {
        const textarea = props.textareaRef.current;
        if (!textarea || props.readOnly) return false;
        const index = props.issues.findIndex((issue) =>
            textarea.selectionStart >= issue.start && textarea.selectionStart <= issue.end,
        );
        const element = mirror.current?.querySelector<HTMLElement>(`[data-issue="${index}"]`);
        if (index < 0 || !element) return false;
        setOpen({ issue: props.issues[index], rect: element.getBoundingClientRect() });
        return true;
    }

    let cursor = 0;
    const segments = props.issues.map((issue, index) => {
        const before = props.value.slice(cursor, issue.start);
        cursor = issue.end;
        return <Fragment key={issue.start}>{before}<span data-issue={index} className="spelling-underline">{props.value.slice(issue.start, issue.end)}</span></Fragment>;
    });
    return (
        <div className="spelling-input">
            <textarea
                ref={props.textareaRef} id={props.id} value={props.value}
                placeholder="What would you like to say?"
                aria-describedby={props.describedBy} aria-keyshortcuts="Alt+ArrowDown"
                readOnly={props.readOnly} maxLength={props.maxLength}
                spellCheck={false} autoCorrect="off"
                onChange={(event) => props.onChange(event.target.value)}
                onScroll={() => { syncMirror(); setOpen(null); }}
                onClick={(event) => {
                    const textarea = event.currentTarget;
                    if (props.readOnly || textarea.selectionStart !== textarea.selectionEnd) return;
                    const layerBounds = mirror.current?.getBoundingClientRect();
                    if (!layerBounds || event.clientY < layerBounds.top || event.clientY > layerBounds.bottom) return;
                    const spans = mirror.current?.querySelectorAll<HTMLElement>("[data-issue]");
                    for (const span of spans ?? []) {
                        for (const rect of Array.from(span.getClientRects())) {
                            if (event.clientX >= rect.left && event.clientX <= rect.right
                                && event.clientY >= rect.top && event.clientY <= rect.bottom) {
                                setOpen({ issue: props.issues[Number(span.dataset.issue)], rect });
                                return;
                            }
                        }
                    }
                    setOpen(null);
                }}
                onKeyDown={(event) => {
                    if (event.altKey && event.key === "ArrowDown" && openAtCaret()) {
                        event.preventDefault();
                        return;
                    }
                    props.onKeyDown(event);
                }}/>
            <div ref={mirror} className="spelling-mirror" aria-hidden="true">
                {segments}{props.value.slice(cursor)}{"\u200b"}
            </div>
            {open && (
                <Suggestions word={open} saving={props.saving}
                             maxLength={props.maxLength} textLength={props.value.length}
                             onClose={(restore) => {
                                 setOpen(null);
                                 if (restore) props.textareaRef.current?.focus();
                             }}
                             onReplace={(suggestion) => {
                                 props.onReplace(open.issue, suggestion);
                                 setOpen(null);
                                 requestAnimationFrame(() => {
                                     const textarea = props.textareaRef.current;
                                     textarea?.focus();
                                     const caret = open.issue.start + suggestion.length;
                                     textarea?.setSelectionRange(caret, caret);
                                 });
                             }}
                             onAdd={async () => {
                                 if (await props.onAdd(open.issue)) {
                                     setOpen(null);
                                     props.textareaRef.current?.focus();
                                 }
                             }}/>
            )}
        </div>
    );
}

function Suggestions({ word, saving, maxLength, textLength, onClose, onReplace, onAdd }: {
    word: OpenWord;
    saving: boolean;
    maxLength: number;
    textLength: number;
    onClose: (restore: boolean) => void;
    onReplace: (suggestion: string) => void;
    onAdd: () => Promise<void>;
}) {
    const popup = useRef<HTMLDivElement>(null);
    const close = useRef(onClose);
    close.current = onClose;
    const [position, setPosition] = useState({ left: -10000, top: -10000 });
    useLayoutEffect(() => {
        const element = popup.current;
        if (!element) return;
        const bounds = element.getBoundingClientRect();
        const above = word.rect.top - bounds.height - 8;
        setPosition({
            left: Math.max(8, Math.min(word.rect.left, window.innerWidth - bounds.width - 8)),
            top: Math.max(8, Math.min(above >= 8 ? above : word.rect.bottom + 8,
                window.innerHeight - bounds.height - 8)),
        });
        element.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    }, [word]);
    useEffect(() => {
        function outside(event: PointerEvent) {
            if (!popup.current?.contains(event.target as Node)) close.current(false);
        }
        function moved(event: Event) {
            if (!popup.current?.contains(event.target as Node)) close.current(false);
        }
        document.addEventListener("pointerdown", outside);
        document.addEventListener("scroll", moved, true);
        window.addEventListener("resize", moved);
        return () => {
            document.removeEventListener("pointerdown", outside);
            document.removeEventListener("scroll", moved, true);
            window.removeEventListener("resize", moved);
        };
    }, []);
    return createPortal(
        <div ref={popup} className="spelling-popover" role="dialog"
             aria-label={`Spelling suggestions for ${word.issue.word}`}
             aria-busy={saving} style={position}
             onBlur={(event) => {
                 if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onClose(false);
             }}
             onKeyDown={(event) => {
                 if (event.key === "Escape") { event.preventDefault(); onClose(true); }
             }}>
            <strong>{word.issue.word}</strong>
            <div className="spelling-popover-actions">
                {word.issue.suggestions.length === 0 && <span>No suggestions</span>}
                {word.issue.suggestions.map((suggestion) => (
                    <button key={suggestion} type="button"
                            disabled={saving || textLength - word.issue.word.length + suggestion.length > maxLength}
                            onClick={() => onReplace(suggestion)}>{suggestion}</button>
                ))}
                <button type="button" className="personal-word-add"
                        title="Add to personal dictionary"
                        aria-label={`Add ${word.issue.word} to personal dictionary`}
                        disabled={saving} onClick={() => void onAdd()}>{saving ? "…" : "+"}</button>
                <button type="button" aria-label="Close spelling suggestions" onClick={() => onClose(true)}>×</button>
            </div>
        </div>, document.body,
    );
}