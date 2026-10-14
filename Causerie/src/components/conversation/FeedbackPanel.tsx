import type { ConversationMessage } from "../../data/models/conversation-types";

interface Props {
    message: ConversationMessage | null;
}

export function FeedbackPanel({ message }: Props) {
    return (
        <section id="conversation-feedback" className="cw-feedback" aria-labelledby="conversation-feedback-heading">
            <h2 id="conversation-feedback-heading">Feedback</h2>

            <div aria-live="polite">
                {message ? (
                    <>
                        <blockquote>{message.content}</blockquote>
                        <p>{message.feedback ?? "No feedback is available for this message yet."}</p>
                    </>
                ) : (
                    <p className="cw-muted">
                        Select "View feedback" on one of your messages.
                    </p>
                )}
            </div>
        </section>
    )
}