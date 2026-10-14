import type { ReactNode } from "react";
import type {
    ConversationMessage,
    ConversationStatus,
    ConversationSummary,
    LearningContext
} from "../../data/models/conversation-types";

import { ThreadSidebar } from "./ThreadSidebar";
import { MascotStage } from "./MascotStage";
import { MessageComposer } from "./MessageComposer";
import { MessageHistory } from "./MessageHistory";
import { FeedbackPanel } from "./FeedbackPanel";
import "./conversation.css"

interface Props {
    threads: ConversationSummary[];
    activeThread: ConversationSummary;
    context: LearningContext;
    messages: ConversationMessage[];
    status: ConversationStatus;
    selectedMessageId: string | null;
    mascot: ReactNode;
    onSelectThread: (id: string) => void;
    onSelectMessage: (id: string) => void;
    onSend: (text: string) => boolean;
}

export function ConversationWorkspace(props: Props) {
    const busy = props.status === "waiting" || props.status === "responding";

    const selectedMessage = props.messages.find(
        (message) => message.id === props.selectedMessageId && message.role === "user"
    ) ?? null;
    
    return (
        <main className="cw">
            <ThreadSidebar threads={props.threads} activeThreadId={props.activeThread.id} disabled={busy} onSelect={props.onSelectThread} />

            <section className="cw-practice" aria-label="Practice area">
                <header className="cw-context">
                    <h2>
                        {props.context.language}
                        {props.context.proficiency ? ` . ${props.context.proficiency}` : ""}
                    </h2>

                    <p className="cw-muted">Learning goals</p>
                    <ul className="cw-goals">
                        {props.context.goals.map((goal) => <li key={goal}>{goal}</li>)}
                    </ul>
                </header>

                <MascotStage status={props.status}>
                    {props.mascot}
                </MascotStage>

                <MessageComposer key={props.activeThread.id} language={props.context.language} busy={busy} onSend={props.onSend}/>
            </section>
            <section className="cw-conversation" aria-labelledby="conversation-title">
                <header className="cw-conversation-header">
                    <h2 id="conversation-title">{props.activeThread.title}</h2>
                    <time dateTime={props.activeThread.createdAt}>
                        {new Date(
                            props.activeThread.createdAt,
                        ).toLocaleDateString()}
                    </time>
                </header>
                <MessageHistory
                    threadId={props.activeThread.id}
                    messages={props.messages}
                    selectedMessageId={props.selectedMessageId}
                    onSelectMessage={props.onSelectMessage}
                />

                <FeedbackPanel message={selectedMessage} />
            </section>
        </main>
    )
}