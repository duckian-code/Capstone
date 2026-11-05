import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { personalDictionary } from "../../services/personal-dictionary";
import type { PersonalPage } from "../../services/personal-dictionary";
import { parseCommandError } from "../../services/command-error";

interface Props {
    userId: string;
    active: boolean;
    onBack: () => void;
    onBusyChange: (busy: boolean) => void;
    onDirtyChange: (dirty: boolean) => void;
}

export function PersonalDictionarySettings(props: Props) {
    const id = useId();
    const heading = useRef<HTMLHeadingElement>(null);
    const lock = useRef(false);
    const [language, setLanguage] = useState("es");
    const [word, setWord] = useState("");
    const [search, setSearch] = useState("");
    const [prefix, setPrefix] = useState("");
    const [cursors, setCursors] = useState<(string | null)[]>([null]);
    const after = cursors[cursors.length - 1];
    const [page, setPage] = useState<PersonalPage>({ entries: [], has_more: false });
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState("");
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        if (props.active) heading.current?.focus();
    }, [props.active]);
    useEffect(() => {
        props.onBusyChange(busy);
        return () => props.onBusyChange(false);
    }, [busy, props.onBusyChange]);
    useEffect(() => {
        props.onDirtyChange(word.trim().length > 0);
        return () => props.onDirtyChange(false);
    }, [word, props.onDirtyChange]);
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setPrefix(search.trim());
            setCursors([null]);
        }, 200);
        return () => window.clearTimeout(timer);
    }, [search]);
    useEffect(() => {
        if (!props.active) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        void personalDictionary.list(props.userId, language, after, prefix)
            .then((result) => { if (!cancelled) setPage(result); })
            .catch((reason: unknown) => {
                if (!cancelled) setError(parseCommandError(reason).message);
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [props.active, props.userId, language, after, prefix, revision]);

    async function mutate(operation: () => Promise<unknown>, message: string, added = false) {
        if (lock.current) return;
        lock.current = true;
        setBusy(true);
        setError(null);
        setNotice("");
        try {
            await operation();
            if (added) setWord("");
            setCursors([null]);
            setRevision((value) => value + 1);
            setNotice(message);
        } catch (reason) {
            setError(parseCommandError(reason).message);
        } finally {
            lock.current = false;
            setBusy(false);
        }
    }

    function add(event: FormEvent) {
        event.preventDefault();
        if (!word.trim()) return;
        void mutate(
            () => personalDictionary.add(props.userId, language, word),
            `Added “${word.trim()}”.`, true,
        );
    }

    return (
        <section className="personal-dictionary-settings" style={props.active ? undefined : { display: "none" }}>
            <button type="button" disabled={busy} onClick={props.onBack}>← Back to settings</button>
            <h3 ref={heading} tabIndex={-1}>Personal dictionary</h3>
            <p>Changes save immediately. Spanish entries apply to both general and Puerto Rican Spanish. Capitalization is ignored; accents remain significant.</p>
            <label htmlFor={`${id}-language`}>Language</label>
            <select id={`${id}-language`} value={language} disabled={busy}
                    onChange={(event) => {
                        setLanguage(event.target.value);
                        setCursors([null]);
                        setPage({ entries: [], has_more: false });
                        setNotice("");
                    }}>
                <option value="es">Spanish (all supported regions)</option>
                <option value="fr">French</option>
            </select>
            <form onSubmit={add}>
                <label htmlFor={`${id}-word`}>Word to add</label>
                <div className="personal-dictionary-row">
                    <input id={`${id}-word`} value={word} maxLength={200} spellCheck={false}
                           disabled={busy} onChange={(event) => setWord(event.target.value)} />
                    <button type="submit" disabled={busy || !word.trim()}>Add word</button>
                </div>
            </form>
            <label htmlFor={`${id}-search`}>Find entries starting with</label>
            <input id={`${id}-search`} value={search} maxLength={100} type="search"
                   disabled={busy} onChange={(event) => setSearch(event.target.value)} />
            {loading && <p role="status">Loading entries…</p>}
            {!loading && page.entries.length === 0 && <p>No matching entries.</p>}
            <ul aria-label="Personal dictionary entries">
                {page.entries.map((entry) => (
                    <li key={entry.word_key} className="personal-dictionary-row">
                        <span>{entry.word}</span>
                        <button type="button" disabled={busy || loading}
                                aria-label={`Remove ${entry.word}`}
                                onClick={() => void mutate(
                                    () => personalDictionary.remove(props.userId, language, entry.word_key),
                                    `Removed “${entry.word}”.`,
                                )}>Remove</button>
                    </li>
                ))}
            </ul>
            <div className="personal-dictionary-row">
                <button type="button" disabled={busy || loading || cursors.length === 1}
                        onClick={() => setCursors((values) => values.slice(0, -1))}>Previous</button>
                <span>Page {cursors.length}</span>
                <button type="button" disabled={busy || loading || !page.has_more}
                        onClick={() => {
                            const last = page.entries[page.entries.length - 1];
                            if (last) setCursors((values) => [...values, last.word_key]);
                        }}>Next</button>
            </div>
            {notice && <p role="status">{notice}</p>}
            {error && <div role="alert"><p>{error}</p><button type="button" disabled={busy || loading}
                                                              onClick={() => setRevision((value) => value + 1)}>Reload entries</button></div>}
        </section>
    );
}