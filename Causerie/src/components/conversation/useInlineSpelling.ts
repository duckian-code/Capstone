import { useEffect, useRef, useState } from "react";
import { checkSpelling } from "../../services/spelling";
import type { SpellingIssue } from "../../services/spelling";
import { parseCommandError } from "../../services/command-error";
import {
    PERSONAL_DICTIONARY_CHANGED, personalDictionary, personalKey,
} from "../../services/personal-dictionary";
import { remapIssues } from "./spelling-edits";

interface Props {
    userId: string;
    language: string;
    text: string;
    onChange: (text: string) => void;
    maxLength: number;
}

export function useInlineSpelling(props: Props) {
    const latest = useRef(props);
    latest.current = props;
    const generation = useRef(0);
    const alive = useRef(true);
    const checked = useRef(false);
    const adding = useRef(false);
    const currentIssues = useRef<SpellingIssue[]>([]);
    const [issues, setIssues] = useState<SpellingIssue[]>([]);
    const [checking, setChecking] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState("");

    function publish(next: SpellingIssue[]) {
        currentIssues.current = next;
        setIssues(next);
    }

    function change(next: string, corrected = false) {
        const before = latest.current.text;
        if (before === next) return;
        generation.current++;
        setChecking(false);
        const remaining = remapIssues(before, next, currentIssues.current);
        publish(remaining);
        latest.current = { ...latest.current, text: next };
        props.onChange(next);
        setError(null);
        if (!next) {
            checked.current = false;
            setStatus("");
        } else if (checked.current) {
            setStatus(corrected
                ? remaining.length
                    ? "Correction applied. Other underlined words are ready to review."
                    : "Correction applied. No remaining marked errors."
                : "Unchanged errors remain underlined. Check spelling to check edited words.");
        }
    }

    async function check() {
        const snapshot = latest.current;
        const request = ++generation.current;
        setChecking(true);
        setError(null);
        try {
            const result = await checkSpelling(
                snapshot.userId, snapshot.text, snapshot.language,
            );
            if (!alive.current || request !== generation.current) return;
            checked.current = true;
            publish(result.issues);
            setStatus(result.issues.length
                ? `${result.issues.length} possible spelling mistakes. Click an underline, or place the caret in a word and press Alt+ArrowDown.`
                : "No spelling mistakes found.");
        } catch (reason) {
            if (alive.current && request === generation.current) {
                setError(parseCommandError(reason).message);
            }
        } finally {
            if (alive.current && request === generation.current) setChecking(false);
        }
    }

    function replace(issue: SpellingIssue, suggestion: string) {
        const text = latest.current.text;
        if (text.slice(issue.start, issue.end) !== issue.word) return;
        const next = text.slice(0, issue.start) + suggestion + text.slice(issue.end);
        if (next.length > latest.current.maxLength) {
            setError("That replacement exceeds the message length limit.");
            return;
        }
        change(next, true);
    }

    async function add(issue: SpellingIssue): Promise<boolean> {
        if (adding.current) return false;
        adding.current = true;
        setSaving(true);
        setError(null);
        const snapshot = latest.current;
        const request = ++generation.current;
        setChecking(false);
        try {
            const entry = await personalDictionary.add(
                snapshot.userId, snapshot.language, issue.word,
            );
            if (!alive.current || request !== generation.current) return false;
            publish(currentIssues.current.filter(
                (item) => personalKey(item.word) !== entry.word_key,
            ));
            setStatus(`Added “${entry.word}” to your personal dictionary.`);
            return true;
        } catch (reason) {
            if (alive.current && request === generation.current) {
                setError(parseCommandError(reason).message);
            }
            return false;
        } finally {
            adding.current = false;
            if (alive.current) setSaving(false);
        }
    }

    useEffect(() => {
        alive.current = true;
        generation.current++;
        checked.current = false;
        publish([]);
        setStatus("");
        setError(null);
        setChecking(false);
        function dictionaryChanged(event: Event) {
            const userId = (event as CustomEvent<{ userId: string }>).detail.userId;
            if (userId === latest.current.userId && checked.current && !adding.current) {
                void check();
            }
        }
        window.addEventListener(PERSONAL_DICTIONARY_CHANGED, dictionaryChanged);
        return () => {
            alive.current = false;
            generation.current++;
            window.removeEventListener(PERSONAL_DICTIONARY_CHANGED, dictionaryChanged);
        };
    }, [props.userId, props.language]);

    return { issues, checking, saving, error, status, change, check, replace, add };
}