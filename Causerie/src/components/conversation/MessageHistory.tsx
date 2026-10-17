import { useEffect, useRef } from "react";
import type { ConversationMessage } from "../../data/models/conversation-types.ts";

interface Props {
    threadId: string;
    prompt: string | null;
    messages: ConversationMessage[];
    selectedMessageId: string | null;
    onSelectMessage: (id: string) => void;
}

const timeFormat = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
});

export function MessageHistory({threadId, prompt, messages, selectedMessageId, onSelectMessage}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const followLatest = useRef(true);

    useEffect(() => {
        followLatest.current = true;
    }, [threadId]);

    useEffect(() => {
        const container = containerRef.current;

        if (container && followLatest.current) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, threadId]);

    return (
        <div ref={containerRef}
             className="cw-history"
             role="region"
             aria-label="Message history"
             tabIndex={0}
             onScroll={(event) => {
                 const element = event.currentTarget;

                 followLatest.current =
                     element.scrollHeight -
                     element.scrollTop -
                     element.clientHeight < 64;
             }}>

            {prompt && (
                <blockquote className="cw-thread-prompt">
                    {prompt}
                </blockquote>
            )}

            {messages.length === 0 ? (
                <p className="cw-empty">Start the conversation below!</p>
            ) : (
                <ol className="cw-messages">
                    {messages.map((message) => (
                        <li key={message.id} className={`cw-message cw-message-${message.role}`}>
                            <article aria-label={message.role === "user" ? "Your message" : "Mascot message"}>
                                <div className="cw-message-meta">
                                    <strong>
                                        {message.role === "user" ? "You" : "Mascot"}
                                    </strong>

                                    <time dateTime={message.createdAt}>
                                        {timeFormat.format(new Date(message.createdAt))}
                                    </time>
                                </div>

                                <p className="cw-message-text">
                                    {message.content}
                                </p>

                                {message.role === "user" && (
                                    <button
                                        type="button"
                                        className="cw-feedback-button"
                                        aria-pressed={selectedMessageId === message.id}
                                        aria-controls="conversation-feedback"
                                        onClick={() => onSelectMessage(message.id)}>
                                        View Feedback
                                    </button>
                                )}
                            </article>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}