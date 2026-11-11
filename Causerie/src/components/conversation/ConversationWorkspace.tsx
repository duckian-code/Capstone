import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import type {
    ConversationMessage,
    ConversationStatus,
    ConversationSummary,
    LearningContext,
} from "../../data/models/conversation-types";

import { useNarrowLayout } from "../../hooks/useNarrowLayout";
import { useFeedbackBadges } from "../../hooks/useFeedbackBadges";
import { LANGUAGE_OPTIONS } from "../../data/models/onboarding-types";

import { ThreadSidebar } from "./ThreadSidebar";
import { MascotStage } from "../mascot/MascotStage";
import { MessageComposer } from "./MessageComposer";
import { MessageHistory } from "./MessageHistory";
import { FeedbackPanel } from "./FeedbackPanel";
import { ThreadActions } from "./ThreadActions";

import "./conversation.css";
import { VoiceComposer } from "./VoiceComposer";
import { AskDotPanel } from "./AskDotPanel";

export type MobileView =
    | "threads"
    | "mascot"
    | "history"
    | "feedback";

interface Props {
    userId: string;
    threads: ConversationSummary[];
    activeThread: ConversationSummary;
    context: LearningContext;
    messages: ConversationMessage[];
    status: ConversationStatus;
    selectedMessageId: string | null;
    mascot: ReactNode;

    mobileView: MobileView;
    onMobileViewChange: (view: MobileView) => void;
    pendingUserMessageId?: string;

    onSelectThread: (id: string) => void;
    onSelectMessage: (id: string) => void;
    onSend: (text: string) => boolean;

    sendDisabled: boolean;
    navigationDisabled: boolean;

    historyLoading: boolean;
    historyError: string | null;
    onRetryHistory: () => void;

    onCreateThread: () => void;
    onRenameThread: (id: string, title: string) => Promise<void>;
    onDeleteThread: (id: string) => Promise<void>;

    canCancel: boolean;
    cancelling: boolean;
    onCancel: () => Promise<string | null>;

    onVoiceSend: (text: string) => Promise<ConversationMessage>;
}

export function ConversationWorkspace(props: Props) {
    const narrow = useNarrowLayout();
    const workspaceRef = useRef<HTMLElement>(null);
    const feedback = useFeedbackBadges(props.activeThread.id);

    const selectedMessage = props.messages.find(
        (message) =>
            message.id === props.selectedMessageId &&
            message.id !== props.pendingUserMessageId &&
            message.role === "user",
    ) ?? null;

    let latestUserMessage: ConversationMessage | null = null;
    let latestAssistantMessage: ConversationMessage | null = null;

    if (!props.historyLoading && !props.historyError) {
        for (let index = props.messages.length - 1; index >= 0; index--) {
            const message = props.messages[index];

            if (
                !latestUserMessage &&
                message.role === "user" &&
                message.id !== props.pendingUserMessageId
            ) {
                latestUserMessage = message;
            }

            if (!latestAssistantMessage && message.role === "assistant") {
                latestAssistantMessage = message;
            }

            if (latestUserMessage && latestAssistantMessage) break;
        }
    }

    const feedbackMessage = narrow
        ? selectedMessage ?? latestUserMessage
        : selectedMessage;

    const feedbackBadge = feedbackMessage
        ? feedback.badges[feedbackMessage.id]
        : undefined;

    const feedbackVisible =
        !narrow || props.mobileView === "feedback";

    const mobileTitle = {
        threads: "Causerie",
        mascot: props.activeThread.title,
        history: "Conversation history",
        feedback: "Feedback",
    }[props.mobileView];

    const languageCode = LANGUAGE_OPTIONS.find(
        (option) => option.value === props.context.language,
    )?.code;

    useEffect(() => {
        if (!narrow) return;

        const selector = props.mobileView === "threads"
            ? ".cw-brand"
            : ".cw-mobile-title";

        workspaceRef.current
            ?.querySelector<HTMLElement>(selector)
            ?.focus({ preventScroll: true });
    }, [narrow, props.mobileView, props.activeThread.id]);

    function selectMessage(id: string) {
        props.onSelectMessage(id);

        if (narrow) {
            props.onMobileViewChange("feedback");
        }
    }

    return (
        <main
            ref={workspaceRef}
            className="cw"
            data-mobile-view={props.mobileView}
        >
            <header className="cw-mobile-toolbar">
                <button
                    type="button"
                    aria-label={
                        props.mobileView === "mascot"
                            ? "Back to threads"
                            : "Back to mascot"
                    }
                    disabled={
                        props.mobileView === "mascot" &&
                        props.navigationDisabled
                    }
                    onClick={() => props.onMobileViewChange(
                        props.mobileView === "mascot"
                            ? "threads"
                            : "mascot",
                    )}
                >
                    ←
                </button>

                <h2 className="cw-mobile-title" tabIndex={-1}>
                    {mobileTitle}
                </h2>

                <nav aria-label="Conversation views">
                    <button
                        type="button"
                        aria-label="Open conversation history"
                        aria-pressed={props.mobileView === "history"}
                        onClick={() => props.onMobileViewChange("history")}
                    >
                        History
                    </button>

                    {feedbackBadge?.available && (
                        <button
                            type="button"
                            className="cw-feedback-shortcut"
                            data-unread={feedbackBadge.unread || undefined}
                            aria-label={
                                feedbackBadge.unread
                                    ? "Open unread feedback"
                                    : "Open feedback"
                            }
                            aria-pressed={props.mobileView === "feedback"}
                            onClick={() =>
                                props.onMobileViewChange("feedback")
                            }
                        >
                            <span aria-hidden="true">!</span>

                            {feedbackBadge.unread && (
                                <span
                                    className="cw-unread-dot"
                                    aria-hidden="true"
                                />
                            )}
                        </button>
                    )}
                </nav>
            </header>

            <ThreadSidebar
                threads={props.threads}
                activeThreadId={props.activeThread.id}
                disabled={props.navigationDisabled}
                onSelect={props.onSelectThread}
                onCreate={props.onCreateThread}
            />

            <section className="cw-practice" aria-label="Practice area">
                <header className="cw-context">
                    <h2>
                        {props.context.language}
                        {props.context.proficiency
                            ? ` · ${props.context.proficiency}`
                            : ""}
                    </h2>

                    {props.context.goals.length > 0 && (
                        <>
                            <p className="cw-muted">Learning goals</p>

                            <ul className="cw-goals">
                                {props.context.goals.map((goal) => (
                                    <li key={goal}>{goal}</li>
                                ))}
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
                    languageCode={languageCode}
                >
                    {props.mascot}
                </MascotStage>

                {props.activeThread.conversationMode === "voice" ? (
                    <VoiceComposer
                        key={`${props.userId}:${props.activeThread.id}:${props.context.language}`}
                        threadId={props.activeThread.id}
                        language={props.context.language}
                        live={props.activeThread.liveConversation ?? false}
                        disabled={props.sendDisabled}
                        canCancel={props.canCancel}
                        cancelling={props.cancelling}
                        messages={props.messages}
                        onSend={props.onVoiceSend}
                        onCancel={props.onCancel}
                    />
                ) : (
                    <MessageComposer
                        userId={props.userId}
                        threadId={props.activeThread.id}
                        key={`${props.userId}:${props.activeThread.id}:${props.context.language}`}
                        language={props.context.language}
                        disabled={props.sendDisabled}
                        canCancel={props.canCancel}
                        cancelling={props.cancelling}
                        onSend={props.onSend}
                        onCancel={props.onCancel}
                        draftKey={`causerie:draft:v1:${props.activeThread.id}`}
                    />
                )}
            </section>

            <section
                className="cw-conversation"
                aria-labelledby="conversation-title"
            >
                <header className="cw-conversation-header">
                    <div className="cw-thread-heading">
                        <h2 id="conversation-title">
                            {props.activeThread.title}
                        </h2>

                        <ThreadActions
                            key={props.activeThread.id}
                            thread={props.activeThread}
                            disabled={props.navigationDisabled}
                            onRename={props.onRenameThread}
                            onDelete={props.onDeleteThread}
                        />
                    </div>

                    <AskDotPanel
                        key={`${props.userId}:${props.activeThread.id}:${props.context.language}`}
                        threadId={props.activeThread.id}
                        language={props.context.language}
                        disabled={props.navigationDisabled}
                    />

                    <time dateTime={props.activeThread.createdAt}>
                        {new Date(
                            props.activeThread.createdAt,
                        ).toLocaleDateString()}
                    </time>

                    {feedback.error && (
                        <div role="alert">
                            <p>
                                Could not update feedback indicators:{" "}
                                {feedback.error}
                            </p>

                            <button
                                type="button"
                                onClick={() => void feedback.refresh()}
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </header>

                {props.historyLoading ? (
                    <div className="cw-history" role="status">
                        Loading conversation…
                    </div>
                ) : props.historyError ? (
                    <div className="cw-history">
                        <p role="alert">{props.historyError}</p>

                        <button
                            type="button"
                            onClick={props.onRetryHistory}
                        >
                            Retry loading
                        </button>
                    </div>
                ) : (
                    <MessageHistory
                        threadId={props.activeThread.id}
                        prompt={props.activeThread.prompt}
                        messages={props.messages}
                        selectedMessageId={props.selectedMessageId}
                        onSelectMessage={selectMessage}
                        feedbackBadges={feedback.badges}
                        visible={
                            !narrow || props.mobileView === "history"
                        }
                    />
                )}

                <FeedbackPanel
                    threadId={props.activeThread.id}
                    message={feedbackVisible ? feedbackMessage : null}
                    visible={feedbackVisible}
                    onRead={feedback.markRead}
                />
            </section>
        </main>
    );
}