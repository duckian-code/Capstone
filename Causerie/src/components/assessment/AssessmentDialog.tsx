import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { assessments, skillName, type AssessmentResponse } from "../../services/assessment";
import { parseCommandError } from "../../services/command-error";
import { AssessmentResults, PassageText } from "./AssessmentResults";

export function AssessmentDialog({ userId, onClose, onCompleted }: {
    userId: string; onClose: () => void; onCompleted: () => void;
}) {
    const [id] = useState(() => crypto.randomUUID());
    const dialog = useRef<HTMLDialogElement>(null);
    const [view, setView] = useState<AssessmentResponse | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmExit, setConfirmExit] = useState<"dialog" | "window" | null>(null);
    const [guardReady, setGuardReady] = useState(false);
    const [started, setStarted] = useState(false);
    const [info, setInfo] = useState<Awaited<ReturnType<typeof assessments.info>> | null>(null);
    const [infoRetry, setInfoRetry] = useState(0);
    const busyRef = useRef(false);
    const dirtyRef = useRef(false);
    const allowWindowClose = useRef(false);
    const pending = useRef<Promise<unknown> | null>(null);
    const alive = useRef(true);
    // Retain the exact request after a transport/save error, even if the commit succeeded.
    const frozenSubmission = useRef<{ blockIndex: number; answers: Record<string, string> } | null>(null);
    const [retryingSubmission, setRetryingSubmission] = useState(false);
    dirtyRef.current = started && view?.status !== "completed";

    useEffect(() => {
        alive.current = true;
        const element = dialog.current!;
        const previous = document.activeElement;
        element.showModal();
        const beforeUnload = (event: BeforeUnloadEvent) => {
            if (dirtyRef.current || busyRef.current) { event.preventDefault(); event.returnValue = "Unfinished assessments will be discarded."; }
        };
        window.addEventListener("beforeunload", beforeUnload);
        let disposed = false;
        let unlisten: (() => void) | undefined;
        getCurrentWindow().onCloseRequested(event => {
            if (allowWindowClose.current) return;
            if (dirtyRef.current || busyRef.current) {
                event.preventDefault();
                if (!busyRef.current) setConfirmExit("window");
            }
        }).then(stop => {
            if (disposed) stop();
            else { unlisten = stop; setGuardReady(true); }
        }).catch(e => { if (!disposed) setError(`Unable to protect unfinished work: ${parseCommandError(e).message}`); });
        return () => {
            alive.current = false; disposed = true; unlisten?.();
            window.removeEventListener("beforeunload", beforeUnload); element.close();
            if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
            // Wait for a possible in-flight start before discarding the original owner's draft.
            // Backend still checks that owner; never substitute the newly active profile ID.
            void Promise.resolve(pending.current).catch(() => undefined)
                .then(() => assessments.cancel(userId, id)).catch(() => undefined);
        };
    }, [id, userId]);

    useEffect(() => {
        let mounted = true;
        setError(null);
        assessments.info().then(value => { if (mounted) setInfo(value); })
            .catch(e => { if (mounted) setError(parseCommandError(e).message); });
        return () => { mounted = false; };
    }, [infoRetry]);

    async function run(request: () => Promise<AssessmentResponse>) {
        if (busyRef.current) return;
        busyRef.current = true; setBusy(true); setError(null);
        try {
            const promise = request(); pending.current = promise;
            const response = await promise;
            if (!alive.current) return;
            if (response.userId !== userId || response.id !== id) throw new Error("Assessment profile mismatch.");
            frozenSubmission.current = null; setRetryingSubmission(false);
            setView(response); setAnswers({});
            if (response.status === "completed") { dirtyRef.current = false; onCompleted(); }
            dialog.current
                ?.querySelector<HTMLElement>(".assessment-content")
                ?.scrollTo({ top: 0 });
        } catch (e) {
            if (alive.current) setError(parseCommandError(e).message);
        } finally {
            busyRef.current = false;
            if (alive.current) setBusy(false);
        }
    }
    function requestClose() {
        if (busyRef.current) return;
        if (dirtyRef.current) setConfirmExit("dialog"); else onClose();
    }
    async function discard() {
        if (busyRef.current) return;
        busyRef.current = true; setBusy(true); setError(null);
        try {
            const promise = assessments.cancel(userId, id); pending.current = promise; await promise;
            if (!alive.current) return;
            if (confirmExit === "window") {
                allowWindowClose.current = true;
                await getCurrentWindow().close();
            }
            onClose();
        } catch (e) {
            allowWindowClose.current = false;
            if (alive.current) setError(parseCommandError(e).message);
        } finally {
            busyRef.current = false;
            if (alive.current) setBusy(false);
        }
    }
    const active = view?.status === "in_progress" ? view : null;
    const total = active ? active.config.blocks * active.config.questionsPerSkill * active.scoringPolicy.includedSkills.length : 0;
    const answered = active ? active.block.items.filter(i => answers[i.id]).length : 0;
    return createPortal(<dialog ref={dialog} className="settings-modal settings-modal-wide assessment-dialog"
        aria-labelledby="assessment-title" aria-busy={busy}
        onCancel={event => { event.preventDefault(); requestClose(); }}>
        <header className="settings-modal-header"><h2 id="assessment-title">French proficiency test</h2>
            <button type="button" disabled={busy} onClick={requestClose} aria-label="Close French proficiency test">×</button></header>
        <div className="assessment-content">
            {confirmExit && <div className="settings-close-confirmation" role="alert">
                <p>Discard this unfinished assessment? Your answers will be lost. It will not appear in assessment history.</p>
                <button type="button" disabled={busy} onClick={() => setConfirmExit(null)}>Continue test</button>{" "}
                <button type="button" disabled={busy} onClick={() => void discard()}>Discard assessment</button>
            </div>}
            {error && <p className="settings-error" role="alert">{error}</p>}
            {!view && !info && <p role="status">{error ? <button type="button" onClick={() => setInfoRetry(n => n+1)}>Retry assessment setup</button> : "Checking assessment configuration and question banks…"}</p>}
            {!view && info && <>
                <p>Answer {info.config.blocks * info.config.questionsPerSkill * info.scoringPolicy.includedSkills.length} questions in {info.config.blocks} blocks:
                    {" "}{info.config.questionsPerSkill} questions per skill per block ({info.scoringPolicy.includedSkills.map(skillName).join(", ")}).
                    Each skill starts at {info.config.startingLevel} and adapts independently within {info.config.levels[0]}–{info.config.levels[info.config.levels.length-1]}.</p>
                <p>You can change answers within a block. Submitted blocks are locked. Answers and explanations are shown after completion.</p>
                <p><strong>Unfinished tests are discarded if you cancel, close, or restart the app.</strong> Completed results are saved to this profile’s assessment history.</p>
                <p>These draft questions provide an estimate based on the assessed skills. Your conversation proficiency setting will not change.</p>
                <button type="button" disabled={busy || !guardReady || !!confirmExit} onClick={() => {
                    setStarted(true); dirtyRef.current = true;
                    void run(() => assessments.start(userId, id));
                }}>{busy ? "Starting…" : started ? "Retry starting assessment" : "Begin assessment"}</button>
            </>}
            {active && <>
                <p role="status">Block {active.block.index + 1} of {active.config.blocks} · {answered} of {active.block.items.length} answered in this block.</p>
                <progress aria-label="Assessment questions answered" max={total}
                    value={active.block.index * active.block.items.length + answered} />
                <form onSubmit={event => {
                    event.preventDefault();
                    if (busyRef.current || confirmExit || answered !== active.block.items.length) return;
                    frozenSubmission.current ??= { blockIndex: active.block.index, answers: { ...answers } };
                    setRetryingSubmission(true);
                    const submission = frozenSubmission.current;
                    void run(() => assessments.submit(userId, id, submission.blockIndex, submission.answers));
                }}>
                    <fieldset disabled={busy || retryingSubmission || !!confirmExit}>
                        <legend>Block {active.block.index + 1} questions</legend>
                        {active.block.items.map((item, index) => <fieldset className="assessment-item" key={item.id}>
                            <legend>{index + 1}. {skillName(item.skill)}</legend>
                            <PassageText passage={item.passage} />
                            <p className="assessment-question" lang="fr">{item.prompt}</p>
                            {item.options.map(option => <label key={option.id} className="assessment-option" lang="fr">
                                <input type="radio" name={item.id} value={option.id} required checked={answers[item.id] === option.id}
                                    onChange={() => setAnswers(previous => ({ ...previous, [item.id]: option.id }))} />
                                <span>{option.text}</span>
                            </label>)}
                        </fieldset>)}
                    </fieldset>
                    <button type="submit" disabled={busy || !!confirmExit || answered !== active.block.items.length}>
                        {busy ? "Saving…" : retryingSubmission ? "Retry this submission" : active.block.index + 1 === active.config.blocks ? "Complete assessment" : "Submit block"}
                    </button>
                    {retryingSubmission && !busy && <p>Your submitted answers are locked while the save is retried. Retry uses the same submission and cannot create duplicate results.</p>}
                </form>
            </>}
            {view?.status === "completed" && <><p role="status">Assessment saved.</p><AssessmentResults record={view} />
                <button type="button" onClick={onClose}>Done</button></>}
        </div>
    </dialog>, document.body);
}
