import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import type { ReactNode } from "react";
import type { Sticky } from "../../data/models/dao-types";
import { dal } from "../../data/dal";
import { parseCommandError } from "../../services/command-error";
import { StickyEditor } from "./StickyEditor";
import "./stickies.css";

interface StickyContextValue {
    stickies: Sticky[];
    loading: boolean;
    error: string | null;
    reload: () => void;
    openText: (text: string) => void;
    openSticky: (sticky: Sticky) => void;
}

export function StickyProvider({ userId, children }: Props) {
    const [stickies, setStickies] = useState<Sticky[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const [draft, setDraft] = useState<Sticky | null>(null);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setError(null);

        void dal.stickies.forUser(userId).then((rows) => {
            if (!cancelled) setStickies(rows);
        }).catch((err: unknown) => {
            if (!cancelled) setError(parseCommandError(err));
        }).finally(() => {
            if (!cancelled) setLoading(false);
        });

        return () => { cancelled = true; };
    }, [userId, revision]);

    function openSticky(sticky: Sticky) {
        if (loading || error || draft) return;

        setDraft(sticky);
    }

    function openText(rawText: string) {
        const text = rawText.trim();

        if (!text || loading || error || draft) return;

        const existing = stickies.find((sticky) => sticky.selected_text === text);

        if (existing) {
            setDraft(existing);
            return;
        }

        const timestamp = new Date().toISOString();

        setDraft({
            id: crypto.randomUUID(),
            user_id: userId,
            selected_text: text,
            title: "",
            user_text: "",
            color: "green",
            created_at: timestamp,
            updated_at: timestamp,
        });
    }

    async function saveSticky(sticky: Sticky) {
        const saved = await dal.stickies.save(sticky);

        setStickies((previous) => [
            saved,
            ...previous.filter((item) => item.id !== saved.id),
        ]);

        setDraft(null);
    }

    async function deleteSticky(id: string) {
        // An unsaved draft has no database row. Deleting a missing ID is harmless.
        await dal.stickies.delete(id);

        setStickies((previous) =>
            previous.filter((sticky) => sticky.id !== id),
        );

        setDraft(null);
    }

    return (
        <StickyContext.Provider
            value={{
                stickies,
                loading,
                error,
                reload: () => setRevision((value) => value + 1),
                openText,
                openSticky,
            }}
        >
            {children}

            {draft && (
                <StickyEditor
                    key={draft.id}
                    sticky={draft}
                    onSave={saveSticky}
                    onDelete={deleteSticky}
                />
            )}
        </StickyContext.Provider>
    );
}

export function useStickies(): StickyContextValue {
    const context = useContext(StickyContext);

    if (!context) {
        throw new Error(
            "useStickies must be used inside StickyProvider.",
        );
    }

    return context;
}