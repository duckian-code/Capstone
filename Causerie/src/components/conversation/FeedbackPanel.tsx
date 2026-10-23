import { useEffect, useState } from "react";

import { dal } from "../../data/dal";
import type { ConversationMessage } from "../../data/models/conversation-types";
import type { TeacherResult } from "../../data/models/feedback-types";
import { parseCommandError } from "../../services/command-error";

interface Props {
    threadId: string;
    message: ConversationMessage | null;
}

type FeedbackState =
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "loaded"; result: TeacherResult };

function FeedbackDetails({
                             threadId,
                             messageId,
                         }: {
    threadId: string;
    messageId: string;
}) {
    const [revision, setRevision] = useState(0);
    const [state, setState] = useState<FeedbackState>({
        kind: "loading",
    });

    useEffect(() => {
        let cancelled = false;
        setState({ kind: "loading" });

        void dal.feedback.forMessage(threadId, messageId).then(
            (result) => {
                if (!cancelled) {
                    setState({ kind: "loaded", result });
                }
            },
            (reason: unknown) => {
                if (!cancelled) {
                    setState({
                        kind: "error",
                        message: parseCommandError(reason).message,
                    });
                }
            },
        );

        return () => {
            cancelled = true;
        };
    }, [threadId, messageId, revision]);

    function retry() {
        setRevision((value) => value + 1);
    }

    if (state.kind === "loading") {
        return <p role="status">Checking your message…</p>;
    }

    if (state.kind === "error") {
        return (
            <>
                <p role="alert">{state.message}</p>
                <button type="button" onClick={retry}>
                    Retry feedback
                </button>
            </>
        );
    }

    if (state.result.status === "unavailable") {
        return (
            <>
                <p>{state.result.message}</p>
                <button type="button" onClick={retry}>
                    Check again
                </button>
            </>
        );
    }

    const { feedback } = state.result;

    return (
        <>
            <p>{feedback.summary}</p>

            {feedback.corrections.length === 0 ? (
                <p className="cw-muted">No corrections suggested.</p>
            ) : (
                <ol>
                    {feedback.corrections.map((correction) => (
                        <li key={correction.id}>
                            <p>
                                <strong>{correction.category}</strong>
                            </p>

                            <p>
                                <del>{correction.original_text}</del>
                                {" → "}
                                {correction.corrected_text ? (
                                    <ins>{correction.corrected_text}</ins>
                                ) : (
                                    <span>Remove this text</span>
                                )}
                            </p>

                            <p>{correction.explanation}</p>
                        </li>
                    ))}
                </ol>
            )}
        </>
    );
}

export function FeedbackPanel({ threadId, message }: Props) {
    return (
        <section
            id="conversation-feedback"
            className="cw-feedback"
            aria-labelledby="conversation-feedback-heading"
        >
            <h2 id="conversation-feedback-heading">Feedback</h2>

            <div aria-live="polite">
                {message ? (
                    <>
                        <blockquote>{message.content}</blockquote>

                        <FeedbackDetails
                            key={`${threadId}:${message.id}`}
                            threadId={threadId}
                            messageId={message.id}
                        />
                    </>
                ) : (
                    <p className="cw-muted">
                        Select “View feedback” on one of your messages.
                    </p>
                )}
            </div>
        </section>
    );
}
