import { parseCommandError } from '../../services/command-error';
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { tutorial, tutorialAction } from '../../services/tutorial';
import { LABELS, LESSONS, nextLesson, type Lesson } from '../../services/tutorial-model';
import { dal } from '../../data/dal';
import { reminders } from '../../services/reminders';
import './tutorial.css';

export function useTutorial() { useSyncExternalStore(tutorial.subscribe, tutorial.snapshot); return tutorial; }
export function TutorialProvider({ userId, children }: { userId: string; children: ReactNode }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retry, setRetry] = useState(0);
    const [notice, setNotice] = useState(false);
    const store = useTutorial();
    useEffect(() => {
        let alive = true;
        setLoaded(false); setError(null);
        void tutorial.load(userId).then(async () => {
            if (!alive) return;
            setLoaded(true);
            const goalsDone = tutorialAction('goals'), remindersDone = tutorialAction('reminders');
            // Existing configuration counts, but opening/replaying a lesson never clears it
            const results = await Promise.allSettled([dal.goals.forUser(userId), reminders.get(userId)]);
            if (!alive) return;
            if (results[0].status === 'fulfilled' && results[0].value.slots.some(Boolean)) goalsDone();
            if (results[1].status === 'fulfilled' && results[1].value.settings.enabled) remindersDone();
        }).catch(e => { if (alive) setError(parseCommandError(e).message); });
        return () => { alive = false; };
    }, [userId, retry]);
    const complete = !!store.state && !nextLesson(store.state);
    useEffect(() => {
        if (loaded && complete && !store.state?.noticeSeen) { setNotice(true); tutorial.acknowledge(); }
    }, [loaded, complete, store.state?.noticeSeen]);
    if (!loaded) return <main className="conversation-placeholder"><p role={error ? 'alert' : 'status'}>{error ?? 'Loading learning space…'}</p>{error && <button onClick={() => setRetry(n => n+1)}>Retry</button>}</main>;
    return <>{children}{store.error && <div className="tutorial-status" role="alert">Tutorial progress could not be saved: {store.error} <button onClick={() => store.retrySave()}>Retry saving</button></div>}
        {notice && <div className="tutorial-status" role="status">You’re all set! Happy learning. <button onClick={() => setNotice(false)}>Dismiss</button></div>}</>;
}
interface TutorialMenuProps {
    onLaunch: (action: () => void) => void;
    launchDisabled?: boolean;
}

export function TutorialMenu({
                                 onLaunch,
                                 launchDisabled = false,
                             }: TutorialMenuProps) {
    const store = useTutorial();
    const [choice, setChoice] = useState<Lesson | "all">("all");

    return (
        <div className="tutorial-menu">
            <p className="settings-help">
                Revisit the introduction or practice an individual feature.
                Replaying preserves your saved preferences and original
                onboarding completion.
            </p>

            {store.state && nextLesson(store.state) && (
                <>
                    <button
                        type="button"
                        disabled={launchDisabled}
                        onClick={() => onLaunch(() => {})}>
                        Continue tutorial
                    </button>

                    <button
                        type="button"
                        onClick={() => store.skipAll()}>
                        Skip remaining tutorial
                    </button>
                </>
            )}

            <label>
                Replay
                <select
                    value={choice}
                    onChange={(event) =>
                        setChoice(event.target.value as Lesson | "all")
                    }>
                    <option value="all">Entire tutorial</option>
                    {LESSONS.map((id) => (
                        <option key={id} value={id}>
                            {LABELS[id]}
                        </option>
                    ))}
                </select>
            </label>

            <button
                type="button"
                disabled={launchDisabled}
                onClick={() =>
                    onLaunch(() =>
                        store.startReplay(
                            choice === "all" ? undefined : choice,
                        ),
                    )
                }>
                Start replay
            </button>

            {store.replaying && (
                <button
                    type="button"
                    onClick={() => store.endReplay()}>
                    Exit replay
                </button>
            )}
        </div>
    );
}