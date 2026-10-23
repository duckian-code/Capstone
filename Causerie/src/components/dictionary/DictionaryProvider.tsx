import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import type { ReactNode } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { dal } from "../../data/dal";
import type { DictionaryResult } from "../../data/models/dictionary-types";
import { parseCommandError } from "../../services/command-error";

import "./dictionary.css";

interface DictionaryContextValue {
    openWord: (word: string) => void;
}

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

interface ProviderProps {
    language: string;
    children: ReactNode;
}

export function DictionaryProvider({language, children,}: ProviderProps) {
    const [word, setWord] = useState<string | null>(null);

    return (
        <DictionaryContext.Provider value={{ openWord: setWord }}>
            {children}

            {word !== null && (
                <DictionaryPanel
                    key={JSON.stringify([language, word])}
                    word={word}
                    language={language}
                    onClose={() => setWord(null)}
                />
            )}
        </DictionaryContext.Provider>
    );
}

export function useDictionary(): DictionaryContextValue {
    const context = useContext(DictionaryContext);

    if (!context) {
        throw new Error(
            "useDictionary must be used inside DictionaryProvider.",
        );
    }

    return context;
}

interface PanelProps {
    word: string;
    language: string;
    onClose: () => void;
}

type LookupState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; result: DictionaryResult };

function DictionaryPanel({ word, language, onClose }: PanelProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [state, setState] = useState<LookupState>({ status: "loading" });
    const [attempt, setAttempt] = useState(0);
    const [linkError, setLinkError] = useState<string | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const previousFocus = document.activeElement;
        dialog.showModal();

        return () => {
            dialog.close();

            if (
                previousFocus instanceof HTMLElement &&
                previousFocus.isConnected
            ) {
                previousFocus.focus();
            }
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        setState({ status: "loading" });

        void dal.dictionary.lookup(word, language)
            .then((result) => {
                if (!cancelled) {
                    setState({ status: "ready", result });
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setState({
                        status: "error",
                        message: parseCommandError(error).message,
                    });
                }
            });

        // ignore responses after closing or switching the selected word
        return () => {
            cancelled = true;
        };
    }, [word, language, attempt]);

    return (
        <dialog
            ref={dialogRef}
            className="dictionary-panel"
            aria-labelledby="dictionary-heading"
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
        >
            <header className="dictionary-toolbar">
                <span>Dictionary</span>

                <button
                    type="button"
                    autoFocus
                    aria-label="Close dictionary"
                    onClick={onClose}
                >
                    ×
                </button>
            </header>

            <h2 id="dictionary-heading" lang="fr">
                {word}
            </h2>

            {/** TODO: NOT HARD CODED!! TARGET TO SOURCE **/}

            <p className="dictionary-direction">French → English</p>

            {state.status === "loading" && (
                <p role="status">Looking up “{word}”…</p>
            )}

            {state.status === "error" && (
                <div>
                    <p role="alert">{state.message}</p>
                    <button
                        type="button"
                        onClick={() => setAttempt((value) => value + 1)}
                    >
                        Retry lookup
                    </button>
                </div>
            )}

            {state.status === "ready" && (
                <>
                    {state.result.meanings.length === 0 ? (
                        <p role="status">
                            No definition was found for this spelling.
                            Try selecting the dictionary form of the word.
                        </p>
                    ) : (
                        <div className="dictionary-meanings">
                            {state.result.meanings.map((meaning, index) => (
                                <section
                                    className="dictionary-meaning"
                                    key={index}
                                    aria-label={`Meaning ${index + 1}`}
                                >
                                    <h3>
                                        {state.result.meanings.length > 1
                                            ? `Meaning ${index + 1}`
                                            : "Translation / meaning"}
                                    </h3>

                                    {meaning.part_of_speech && (
                                        <p className="dictionary-part-of-speech">
                                            {meaning.part_of_speech}
                                        </p>
                                    )}

                                    <p lang="en">{meaning.translation}</p>

                                    <h4>Phrase using this word</h4>

                                    {meaning.phrase ? (
                                        <>
                                            <blockquote lang="fr">
                                                {meaning.phrase}
                                            </blockquote>

                                            <h4>Phrase translation</h4>

                                            <p lang="en">
                                                {meaning.phrase_translation ??
                                                    "No translation is available for this example."}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="dictionary-muted">
                                            No example phrase is available
                                            for this meaning.
                                        </p>
                                    )}
                                </section>
                            ))}
                        </div>
                    )}

                    <footer className="dictionary-source">
                        <p>Source: Wiktionary, via WiktAPI.</p>

                        <button
                            type="button"
                            onClick={() => {
                                setLinkError(null);

                                void openUrl(state.result.source_url)
                                    .catch((error: unknown) => {
                                        setLinkError(
                                            parseCommandError(error).message,
                                        );
                                    });
                            }}
                        >
                            Open Wiktionary entry
                        </button>

                        {linkError && <p role="alert">{linkError}</p>}
                    </footer>
                </>
            )}
        </dialog>
    );
}