import {
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import type { FormEvent, RefObject } from "react";
import { createPortal } from "react-dom";
import { openUrl } from "@tauri-apps/plugin-opener";
import { lookupEnglishWord } from "../../services/english-dictionary";
import type { EnglishLookup } from "../../services/english-dictionary";
import { parseCommandError } from "../../services/command-error";
import "./english-dictionary.css";

interface ButtonProps {
    language: string;
    label: string;
}

export function EnglishDictionaryButton({ language, label }: ButtonProps) {
    const button = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const id = useId();

    return (
        <>
            <button
                ref={button}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? id : undefined}
                title="Look up an English word"
                onClick={() => setOpen((value) => !value)}
            >
                Dictionary
            </button>

            {open && (
                <LookupPanel
                    key={language}
                    id={id}
                    anchor={button}
                    language={language}
                    label={label}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}

interface PanelProps extends ButtonProps {
    id: string;
    anchor: RefObject<HTMLButtonElement | null>;
    onClose: () => void;
}

function LookupPanel({ id, anchor, language, label, onClose }: PanelProps) {
    const dialog = useRef<HTMLDialogElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const close = useRef(onClose);
    close.current = onClose;

    const generation = useRef(0);
    const [word, setWord] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<EnglishLookup | null>(null);

    useLayoutEffect(() => {
        const panel = dialog.current;
        if (!panel) return;

        panel.show();

        function position() {
            const rect = anchor.current?.getBoundingClientRect();
            if (!rect || !panel) return;

            const bounds = panel.getBoundingClientRect();
            const above = rect.top - bounds.height - 8;

            const left = Math.max(
                8,
                Math.min(
                    rect.right - bounds.width,
                    window.innerWidth - bounds.width - 8,
                ),
            );

            const top = Math.max(
                8,
                Math.min(
                    above >= 8 ? above : rect.bottom + 8,
                    window.innerHeight - bounds.height - 8,
                ),
            );

            panel.style.left = `${left}px`;
            panel.style.top = `${top}px`;
        }

        position();
        input.current?.focus();

        const observer = new ResizeObserver(position);
        observer.observe(panel);
        if (anchor.current) observer.observe(anchor.current);

        window.addEventListener("resize", position);
        document.addEventListener("scroll", position, true);

        return () => {
            const restoreFocus =
                panel.contains(document.activeElement) ||
                document.activeElement === document.body;

            panel.close();
            observer.disconnect();
            window.removeEventListener("resize", position);
            document.removeEventListener("scroll", position, true);

            if (restoreFocus) anchor.current?.focus();
        };
    }, [anchor]);

    useEffect(() => {
        function outside(event: PointerEvent) {
            const target = event.target as Node;

            if (
                !dialog.current?.contains(target) &&
                !anchor.current?.contains(target)
            ) {
                close.current();
            }
        }

        document.addEventListener("pointerdown", outside);

        return () => {
            generation.current++;
            document.removeEventListener("pointerdown", outside);
        };
    }, [anchor]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        // Portal events otherwise bubble into the composer form.
        event.stopPropagation();

        if (busy || !word.trim()) return;

        const request = ++generation.current;
        setBusy(true);
        setError(null);
        setResult(null);

        try {
            const response = await lookupEnglishWord(word.trim(), language);
            if (request === generation.current) setResult(response);
        } catch (reason) {
            if (request === generation.current) {
                setError(parseCommandError(reason).message);
            }
        } finally {
            if (request === generation.current) setBusy(false);
        }
    }

    return createPortal(
        <dialog
            ref={dialog}
            id={id}
            className="english-dictionary-panel"
            aria-labelledby={`${id}-title`}
            onKeyDown={(event) => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    onClose();
                }
            }}>
            <header>
                <h2 id={`${id}-title`}>English → {label}</h2>
                <button
                    type="button"
                    aria-label="Close dictionary"
                    onClick={onClose}>
                    ×
                </button>
            </header>

            <form onSubmit={submit}>
                <label htmlFor={`${id}-word`}>English word</label>
                <div className="english-dictionary-search">
                    <input
                        ref={input}
                        id={`${id}-word`}
                        value={word}
                        maxLength={100}
                        autoComplete="off"
                        spellCheck={false}
                        required
                        onChange={(event) => {
                            generation.current++;
                            setBusy(false);
                            setResult(null);
                            setError(null);
                            setWord(event.target.value);
                        }}/>
                    <button type="submit" disabled={busy || !word.trim()}>
                        Look up
                    </button>
                </div>
            </form>

            {busy && <p role="status">Looking up “{word.trim()}”…</p>}
            {error && <p role="alert">{error}</p>}

            {result && (
                <>
                    <p role="status">
                        {result.translations.length
                            ? `Translations for “${result.word}”`
                            : "No translation found. Try another spelling or the base form of the word."}
                    </p>

                    {result.target_locale === "es-PR" && (
                        <p className="english-dictionary-note">
                            These are Spanish dictionary translations;
                            regional usage may vary.
                        </p>
                    )}

                    <ol>
                        {result.translations.map((item, index) => (
                            <li key={index}>
                                <strong lang={result.target_locale}>
                                    {item.word}
                                </strong>
                                {item.part_of_speech && (
                                    <span> · {item.part_of_speech}</span>
                                )}
                                {item.sense && <p>{item.sense}</p>}
                                {item.tags.length > 0 && (
                                    <p>{item.tags.join(", ")}</p>
                                )}
                            </li>
                        ))}
                    </ol>

                    <footer>
                        Source: Wiktionary via WiktAPI.
                        <button
                            type="button"
                            onClick={() => {
                                void openUrl(result.source_url).catch(
                                    (reason: unknown) => {
                                        setError(
                                            parseCommandError(reason).message,
                                        );
                                    },
                                );
                            }}>
                            View source
                        </button>
                    </footer>
                </>
            )}
        </dialog>,
        document.body,
    );
}