import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {assessments, skillName, type AssessmentResponse, TOO_DIFFICULT_ANSWER} from "../../services/assessment";
import { parseCommandError } from "../../services/command-error";
import { AssessmentResults, PassageText } from "./AssessmentResults";

export function AssessmentDialog({ userId, onClose, onCompleted }: {
    userId: string; onClose: () => void; onCompleted: () => void;
}) {
    const [id] = useState(() => crypto.randomUUID());
    const dialog = useRef<HTMLDialogElement>(null);
    const [view, setView] = useState<AssessmentResponse | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [struckOptions, setStruckOptions] =
        useState<Record<string, string[]>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const questionHeading = useRef<HTMLParagraphElement>(null);
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
    const [pendingSkipSkill, setPendingSkipSkill] = useState<string | null>(null);

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
            setView(response);
            setAnswers({});
            setStruckOptions({});
            setCurrentQuestionIndex(0);
            setPendingSkipSkill(null);
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

    function toggleOptionStrike(questionId: string, optionId: string) {
        if (
            busyRef.current ||
            retryingSubmission ||
            confirmExit ||
            pendingSkipSkill !== null ||
            answers[questionId] === TOO_DIFFICULT_ANSWER
        ) return;

        const isStruck = struckOptions[questionId]?.includes(optionId) ?? false;

        setStruckOptions(previous => {
            const options = previous[questionId] ?? [];

            return {
                // TODO: evaluate type mismatch with options
                ...previous,
                [questionId]: isStruck
                    ? options.filter(id => id !== optionId)
                    : [...options, optionId],
            };
        });

        // Eliminating the selected answer makes this question unanswered.
        if (!isStruck) {
            setAnswers(previous => {
                if (previous[questionId] !== optionId) return previous;

                const next = { ...previous };
                delete next[questionId];
                return next;
            });
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
    const questionCount = active?.block.items.length ?? 0;
    const currentQuestion = active?.block.items[currentQuestionIndex];
    const blockNumber = active ? active.block.index + 1 : 0;
    const isFollowUp = active?.block.phase === "follow_up";

    const answered = active
        ? active.block.items.filter(item => Boolean(answers[item.id])).length
        : 0;

    const totalAnswered = (active?.answeredQuestionCount ?? 0) + answered;
    const currentQuestionSkipped = currentQuestion
        ? answers[currentQuestion.id] === TOO_DIFFICULT_ANSWER
        : false;

    const availableQuestionIndices = active
        ? active.block.items.flatMap((item, index) =>
            answers[item.id] === TOO_DIFFICULT_ANSWER ? [] : [index]
        )
        : [];

    const previousQuestionIndex = [...availableQuestionIndices]
        .reverse()
        .find(index => index < currentQuestionIndex) ?? -1;

    const nextQuestionIndex = availableQuestionIndices
        .find(index => index > currentQuestionIndex) ?? -1;

    const isLastQuestion = nextQuestionIndex === -1;
    const navigationLocked = busy || !!confirmExit || pendingSkipSkill !== null;
    const answersLocked =
        navigationLocked || retryingSubmission || currentQuestionSkipped;

    const firstUnansweredIndex = active
        ? active.block.items.findIndex(item => !answers[item.id])
        : -1;

    function navigateToQuestion(index: number) {
        if (busyRef.current || confirmExit || pendingSkipSkill !== null) return;
        if (index < 0 || index >= questionCount) return;
        setCurrentQuestionIndex(index);
    }

    function confirmDifficultySkip() {
        if (
            !active ||
            !pendingSkipSkill ||
            busyRef.current ||
            retryingSubmission ||
            confirmExit
        ) return;

        const nextAnswers = { ...answers };

        for (const item of active.block.items) {
            if (item.skill === pendingSkipSkill) {
                nextAnswers[item.id] = TOO_DIFFICULT_ANSWER;
            }
        }

        const remainingIndices = active.block.items.flatMap((item, index) =>
            nextAnswers[item.id] === TOO_DIFFICULT_ANSWER ? [] : [index]
        );

        setAnswers(nextAnswers);
        setPendingSkipSkill(null);

        const blockComplete = active.block.items.every(
            item => Boolean(nextAnswers[item.id])
        );

        if (blockComplete) {
            // Keep the retry button accessible if saving fails.
            setCurrentQuestionIndex(
                remainingIndices[remainingIndices.length - 1]
                ?? questionCount - 1
            );

            frozenSubmission.current = {
                blockIndex: active.block.index,
                answers: { ...nextAnswers },
            };

            setRetryingSubmission(true);
            const submission = frozenSubmission.current;

            void run(() => assessments.submit(
                userId,
                id,
                submission.blockIndex,
                submission.answers,
            ));
            return;
        }

        const destination =
            remainingIndices.find(index => index > currentQuestionIndex)
            ?? remainingIndices.find(
                index => !nextAnswers[active.block.items[index].id]
            )
            ?? remainingIndices[remainingIndices.length - 1]
            ?? questionCount - 1;

        setCurrentQuestionIndex(destination);
    }

    useEffect(() => {
        if (confirmExit) setPendingSkipSkill(null);
    }, [confirmExit]);

    useEffect(() => {
        if (!active) return;

        questionHeading.current?.focus({ preventScroll: true });
        dialog.current
            ?.querySelector<HTMLElement>(".assessment-content")
            ?.scrollTo({ top: 0 });
    }, [active?.block.index, currentQuestionIndex]);

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
                <p>Start with {info.config.blocks * info.config.questionsPerSkill * info.scoringPolicy.includedSkills.length} questions in {info.config.blocks} blocks:
                    {" "}{info.config.questionsPerSkill} questions per skill per block ({info.scoringPolicy.includedSkills.map(skillName).join(", ")}).
                    Each skill starts at {info.config.startingLevel} and adapts independently within {info.config.levels[0]}–{info.config.levels[info.config.levels.length-1]}.</p>
                {info.config.followUp && <p>If a skill routes to a lower level after the final main block and still has no placement,
                    you will receive {info.config.questionsPerSkill} follow-up questions for that skill per round.
                    Follow-ups continue until that skill has a placement or no full set of unused questions remains.
                    Established skills receive no extra questions. If questions run out, the result is saved as “Placement not established”.</p>}
                <p>You can change answers within a block. Submitted blocks are locked. Answers and explanations are shown after completion.</p>
                <p><strong>Unfinished tests are discarded if you cancel, close, or restart the app.</strong> Completed results are saved to this profile’s assessment history.</p>
                <p>These draft questions provide an estimate based on the assessed skills. Your conversation proficiency setting will not change.</p>
                <button type="button" disabled={busy || !guardReady || !!confirmExit} onClick={() => {
                    setStarted(true); dirtyRef.current = true;
                    void run(() => assessments.start(userId, id));
                }}>{busy ? "Starting…" : started ? "Retry starting assessment" : "Begin assessment"}</button>
            </>}
            {active && currentQuestion && <>
                <div className="assessment-round-header">
                    <div>
                        <p className="assessment-block-label">
                            Block{" "}
                            <span className={isFollowUp ? "assessment-extra-round" : undefined}>
                    {blockNumber}
                </span>
                            <span>/{active.config.blocks}</span>
                        </p>
                        {isFollowUp && (
                            <p className="assessment-round-note">Additional round</p>
                        )}
                    </div>

                    <p className="assessment-total-answered" role="status">
                        <strong>{totalAnswered}</strong> total questions answered
                    </p>
                </div>

                <progress
                    aria-label="Questions answered in this block"
                    max={questionCount}
                    value={answered}/>

                {/*<p className="assessment-block-progress">*/}
                {/*    {answered} of {questionCount} answered in this block*/}
                {/*</p>*/}

                <form
                    noValidate
                    onSubmit={event => {
                        event.preventDefault();

                        if (
                            busyRef.current ||
                            confirmExit ||
                            pendingSkipSkill !== null ||
                            !isLastQuestion ||
                            answered !== questionCount
                        ) return;

                        frozenSubmission.current ??= {
                            blockIndex: active.block.index,
                            answers: { ...answers },
                        };

                        setRetryingSubmission(true);
                        const submission = frozenSubmission.current;

                        void run(() => assessments.submit(
                            userId,
                            id,
                            submission.blockIndex,
                            submission.answers,
                        ));
                    }}>

                    <div className="assessment-question-toolbar">
                        <span>
                            Question {currentQuestionIndex + 1} / {questionCount}
                        </span>

                        <button
                            type="button"
                            className="assessment-too-difficult"
                            disabled={answersLocked}
                            onClick={() => setPendingSkipSkill(currentQuestion.skill)}>
                            Too difficult
                        </button>
                    </div>

                    <fieldset
                        className="assessment-item"
                        key={currentQuestion.id}
                        disabled={answersLocked}>
                        <legend>{skillName(currentQuestion.skill)}</legend>
                        {currentQuestionSkipped && (
                            <p role="status">
                                This category was skipped. Its questions count as incorrect.
                                You can submit the block when all remaining questions are answered.
                            </p>
                        )}

                        <p className="settings-help">
                            Click × to strike out an option. Click it again to restore the option.
                        </p>

                        <PassageText passage={currentQuestion.passage} />

                        <p
                            ref={questionHeading}
                            className="assessment-question"
                            lang="fr"
                            tabIndex={-1}>
                            {currentQuestion.prompt}
                        </p>

                        {currentQuestion.options.map(option => {
                            const isStruck =
                                struckOptions[currentQuestion.id]?.includes(option.id)
                                ?? false;

                            return (
                                <div
                                    key={option.id}
                                    className={`assessment-option-row${isStruck ? " is-struck" : ""}`}>
                                    <button
                                        type="button"
                                        className="assessment-option-strike"
                                        aria-label={`Strike out option: ${option.text}`}
                                        aria-pressed={isStruck}
                                        title={
                                            isStruck
                                                ? "Restore this option"
                                                : "Strike out this option"
                                        }
                                        onClick={() => toggleOptionStrike(
                                            currentQuestion.id,
                                            option.id,
                                        )}>
                                        <span aria-hidden="true">×</span>
                                    </button>

                                    <label className="assessment-option" lang="fr">
                                        <input
                                            type="radio"
                                            name={currentQuestion.id}
                                            value={option.id}
                                            disabled={isStruck}
                                            checked={
                                                answers[currentQuestion.id] === option.id
                                            }
                                            onChange={() => {
                                                if (isStruck || answersLocked) return;

                                                setAnswers(previous => ({
                                                    ...previous,
                                                    [currentQuestion.id]: option.id,
                                                }));
                                            }}
                                        />
                                        <span>{option.text}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </fieldset>

                    <div className="assessment-question-navigation">
                        <button
                            type="button"
                            disabled={navigationLocked || previousQuestionIndex === -1}
                            onClick={() => navigateToQuestion(previousQuestionIndex)}>
                            Previous
                        </button>

                        <span className="assessment-question-position">
                {currentQuestionIndex + 1} / {questionCount}
            </span>

                        {!isLastQuestion ? (
                            <button
                                key="next"
                                type="button"
                                disabled={navigationLocked}
                                onClick={() => navigateToQuestion(nextQuestionIndex)}>
                                Next
                            </button>
                        ) : (
                            <button
                                key="submit"
                                type="submit"
                                disabled={navigationLocked || answered !== questionCount}>
                                {busy
                                    ? "Saving…"
                                    : retryingSubmission
                                        ? "Retry submission"
                                        : "Submit block"}
                            </button>
                        )}
                    </div>

                    {isLastQuestion && firstUnansweredIndex !== -1 && (
                        <p className="assessment-unanswered-notice">
                            Answer all questions before submitting.{" "}
                            <button
                                type="button"
                                disabled={navigationLocked}
                                onClick={() => navigateToQuestion(firstUnansweredIndex)}>
                                Go to first unanswered question
                            </button>
                        </p>
                    )}

                    {retryingSubmission && !busy && (
                        <p role="status">
                            Your submitted answers are locked while the save is retried.
                            Retry uses the same submission and cannot create duplicate results.
                        </p>
                    )}
                </form>
            </>}
            {view?.status === "completed" && <><p role="status">Assessment saved.</p><AssessmentResults record={view} />
                <button type="button" onClick={onClose}>Done</button></>}
        </div>
        {pendingSkipSkill !== null && (
            <DifficultySkipDialog
                category={skillName(pendingSkipSkill)}
                isAtMinimumLevel={
                    active?.block.items.find(
                        item => item.skill === pendingSkipSkill
                    )?.administeredDifficulty === "A1"
                }
                onCancel={() => setPendingSkipSkill(null)}
                onConfirm={confirmDifficultySkip}
            />
        )}
    </dialog>, document.body);
}

function DifficultySkipDialog({
                                  category,
                                  isAtMinimumLevel,
                                  onCancel,
                                  onConfirm,
                              }: {
    category: string;
    isAtMinimumLevel: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const modal = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const element = modal.current!;
        element.showModal();

        return () => element.close();
    }, []);

    return createPortal(
        <dialog
            ref={modal}
            className="assessment-difficulty-dialog"
            aria-labelledby="difficulty-skip-title"
            aria-describedby={[
                "difficulty-skip-description",
                isAtMinimumLevel ? "difficulty-skip-minimum" : "",
                "difficulty-skip-important",
            ].filter(Boolean).join(" ")}
            onCancel={event => {
                event.preventDefault();
                event.stopPropagation();
                onCancel();
            }}>
            <h3 id="difficulty-skip-title">
                Skip{" "}
                <span className="assessment-category-highlight">
                    {category}
                </span>
                ?
            </h3>

            <div id="difficulty-skip-description">
                <p>
                    All{" "}
                    <strong className="assessment-category-highlight">
                        {category}
                    </strong>{" "}
                    questions in this block will be marked incorrect,
                    including any you already answered.
                </p>

                {!isAtMinimumLevel && (
                    <p>
                        This category’s next difficulty will drop by one level.
                    </p>
                )}
            </div>

            {isAtMinimumLevel && (
                <p
                    id="difficulty-skip-minimum"
                    className="assessment-minimum-notice">
                    <strong>Already at A1:</strong> this category is at the
                    lowest difficulty and will remain at A1.
                </p>
            )}

            <div
                id="difficulty-skip-important"
                className="assessment-skip-important">
                <strong>Important</strong>
                <p>You cannot undo this for the current block.</p>
            </div>

            <p>Are you sure you want to continue?</p>

            <div className="assessment-difficulty-actions">
                <button type="button" autoFocus onClick={onCancel}>
                    Keep answering
                </button>
                <button
                    type="button"
                    className="assessment-too-difficult"
                    onClick={onConfirm}>
                    Yes, skip category
                </button>
            </div>
        </dialog>,
        document.body,
    );
}