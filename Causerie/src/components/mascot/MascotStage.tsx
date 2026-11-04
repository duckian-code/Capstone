import type { ReactNode } from "react";
import type {
    ConversationMessage,
    ConversationStatus,
} from "../../data/models/conversation-types.ts";
import { MascotSpeech } from "./MascotSpeech";

interface Props {
    threadId: string;
    status: ConversationStatus;
    message: ConversationMessage | null;
    historyUnavailable: boolean;
    languageCode?: string;
    children: ReactNode;
}

const statusText: Record<ConversationStatus, string> = {
    idle: "Waiting on input.",
    waiting: "Thinking about your message...",
    responding: "Replying...",
    error: "Something went wrong!",
};

export function MascotStage({
                                threadId,
                                status,
                                message,
                                historyUnavailable,
                                languageCode,
                                children,
                            }: Props) {
    return (
        <section className="cw-stage" aria-label="Conversation partner">
            <p className="cw-status" role="status">
                {statusText[status]}
            </p>

            <MascotSpeech
                key={threadId}
                message={message}
                status={status}
                unavailable={historyUnavailable}
                languageCode={languageCode}/>

            <div className="cw-mascot">
                {children}
            </div>
        </section>
    );
}