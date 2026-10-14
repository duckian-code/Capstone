import type { ReactNode } from "react";
import type { ConversationStatus } from "../../data/models/conversation-types.ts";

interface Props {
    status: ConversationStatus;
    children: ReactNode;
}

const statusText: Record<ConversationStatus, string> = {
    idle: "Waiting on input.",
    waiting: "Thinking about your message...",
    responding: "Replying...",
    error: "Something went wrong!",
};

export function MascotStage({ status, children }: Props) {
    return (
        <section className="cw-stage" aria-label="Conversation partner">
            <p className="cw-status" role="status">
                {statusText[status]}
            </p>

            <div className="cw-mascot">{children}</div>
        </section>
    );
}