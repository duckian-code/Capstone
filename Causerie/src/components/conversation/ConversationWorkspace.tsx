import type { ReactNode } from "react";
import type {
    ConversationMessage,
    ConversationStatus,
    ConversationSummary,
    LearningContext
} from "../../data/models/conversation-types";

import { ThreadSidebar } from "./ThreadSidebar";
import { MascotStage } from "../mascot/MascotStage.tsx";
import { MessageComposer } from "./MessageComposer";
import { MessageHistory } from "./MessageHistory";
import { FeedbackPanel } from "./FeedbackPanel";
import { LANGUAGE_OPTIONS } from "../../data/models/onboarding-types";
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
    // additional props for accepting operation states
    sendDisabled: boolean;
    navigationDisabled: boolean;
    historyLoading: boolean;
    historyError: string | null;
    onRetryHistory: () => void;
    onCreateThread: () => void;
}

export function ConversationWorkspace(props: Props) {
    // const busy = props.status === "waiting" || props.status === "responding";

    const selectedMessage = props.messages.find(
        (message) => message.id === props.selectedMessageId && message.role === "user"
    ) ?? null;

    let latestAssistantMessage: ConversationMessage | null = null;

    if (!props.historyLoading && !props.historyError) {
        for (let index = props.messages.length - 1; index >= 0; index--) {
            const message = props.messages[index];

            if (message.role === "assistant") {
                latestAssistantMessage = message;
                break;
            }
        }
    }

    const languageCode = LANGUAGE_OPTIONS.find(
        (option) => option.value === props.context.language,
    )?.code;

    return (
        <main className="cw">
            <ThreadSidebar threads={props.threads} activeThreadId={props.activeThread.id} disabled={props.navigationDisabled} onSelect={props.onSelectThread} onCreate={props.onCreateThread}/>

            <section className="cw-practice" aria-label="Practice area">
                <header className="cw-context">
                    <h2>
                        {props.context.language}
                        {props.context.proficiency ? ` . ${props.context.proficiency}` : ""}
                    </h2>

                    {props.context.goals.length > 0 && (
                        <>
                            <p className="cw-muted">Learning goals</p>

                            <ul className="cw-goals">
                                {props.context.goals.map((goal) => <li key={goal}>{goal}</li>)}
                            </ul>
                        </>
                    )}
                </header>

                <MascotStage
                    threadId={props.activeThread.id}
                    status={props.status}
                    message={latestAssistantMessage}
                    historyUnavailable={
                        props.historyLoading || Boolean(props.historyError)
                    }
                    languageCode={languageCode}>
                    {props.mascot}
                </MascotStage>

                <MessageComposer key={props.activeThread.id} language={props.context.language} disabled={props.sendDisabled} onSend={props.onSend}/>
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
                {props.historyLoading ? (
                    <div className="cw-history" role="status">
                        Loading conversation…
                    </div>
                ) : props.historyError ? (
                    <div className="cw-history">
                        <p role="alert">{props.historyError}</p>
                        <button type="button" onClick={props.onRetryHistory}>
                            Retry loading
                        </button>
                    </div>
                ) : (
                    <MessageHistory
                        threadId={props.activeThread.id}
                        prompt={props.activeThread.prompt}
                        messages={props.messages}
                        selectedMessageId={props.selectedMessageId}
                        onSelectMessage={props.onSelectMessage}
                    />
                )}


                <FeedbackPanel threadId={props.activeThread.id} message={selectedMessage} />
            </section>
        </main>
    )
}