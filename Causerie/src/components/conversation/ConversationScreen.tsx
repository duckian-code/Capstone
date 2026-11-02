import {LearningContext} from "../../data/models/conversation-types.ts";
import {useConversationController} from "../../hooks/useConversationController.ts";
import {useCallback, useState} from "react";
import {ErrorToast, Toast} from "../ErrorToast.tsx";
import {ConversationWorkspace} from "./ConversationWorkspace.tsx";
import {MascotCanvas} from "../mascot/MascotCanvas.tsx";
import {ThreadCreationDialog} from "../ThreadCreationDialog.tsx";
import {StickyProvider} from "../sticky/StickyProvider.tsx";
import { DictionaryProvider } from "../dictionary/DictionaryProvider";
import type { MobileView } from "./ConversationWorkspace";
import { ThreadSidebar } from "./ThreadSidebar";

interface Props {
    userId: string;
    context: LearningContext;
}

// remount session if user switching is implemented in the future
export function ConversationScreen(props: Props) {
    return (
        <StickyProvider key={props.userId} userId={props.userId}>
            <DictionaryProvider key={props.context.language} language={props.context.language}>
                <ConversationSession {...props} />
            </DictionaryProvider>
        </StickyProvider>
    );
}

function ConversationSession({ userId, context }: Props) {
    const conversation = useConversationController(userId);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [creationOpen, setCreationOpen] = useState(false);

    const [mobileView, setMobileView] = useState<MobileView>("threads");

    function openCreation() {
        if (conversation.navigationDisabled) return;

        conversation.clearCreationError();
        setCreationOpen(true);
    }

    const creationDialog = creationOpen ? (
        <ThreadCreationDialog
            creating={conversation.creatingThread}
            error={conversation.operationError}
            onClearError={conversation.clearCreationError}
            onCreate={async (input) => {
                const created = await conversation.createThread(input);

                if (created) {
                    setSelectedMessageId(null);
                    setMobileView("mascot");
                }

                return created;
            }}
            onClose={() => setCreationOpen(false)}
        />
    ) : null;

    const showError = useCallback((message: string) => {
        setToast({
            id: Date.now(),
            message
        });
    }, []);

    const dismissToast = useCallback(() => {
        setToast(null);
    }, []);

    function selectThread(id: string) {
        if (conversation.selectThread(id)) {
            setSelectedMessageId(null);
            setMobileView("mascot");
        }
    }

    if (conversation.threadsLoading) {
        return (
            <main className="conversation-placeholder" role="status">
                Loading conversations...
            </main>
        );
    }

    if (conversation.threadsError) {
        return (
            <main className="conversation-placeholder">
                <p role="alert">{conversation.threadsError}</p>
                <button type="button" onClick={conversation.reloadThreads}>
                    Retry
                </button>
            </main>
        );
    }

    // TODO: evaluate placeholder starter
    if (!conversation.activeThread) {
        return (
            <div className="conversation-screen">
                <main
                    className="cw cw-empty-workspace"
                    data-mobile-view="threads"
                >
                    <ThreadSidebar
                        threads={conversation.threads}
                        activeThreadId=""
                        disabled={conversation.creatingThread}
                        onSelect={selectThread}
                        onCreate={openCreation}
                    />
                </main>

                {creationDialog}
            </div>
        );
    }

    const progressText = {
        idle: "",
        "saving-user": "Saving your message…",
        streaming: "Receiving a reply…",
        "saving-reply": "Saving the reply…",
        animating: "Displaying the reply…",
        failed: "",
        cancelling: "Cancelling your message…",
        "cancel-failed": "",
    }[conversation.phase];

    return (
        <div className="conversation-screen">
            <div className="conversation-operation">
                <p role="status">{progressText}</p>
                {conversation.cancellationFailed && (
                    <p role="alert">
                        {conversation.operationError} Click Cancel again to retry cleanup.
                    </p>
                )}

                {conversation.recoveryRequired && (
                    <div>
                        <p role="alert">
                            {conversation.operationError}
                        </p>

                        <p>
                            Your pending turn is retained here.
                            Retry to continue from the unfinished step.
                        </p>

                        <button
                            type="button"
                            onClick={conversation.retryTurn}
                        >
                            Retry
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setSelectedMessageId(null);
                                conversation.leaveRecovery();
                            }}
                        >
                            Discard unsaved content and reload history
                        </button>
                    </div>
                )}
            </div>

            <ConversationWorkspace
                threads={conversation.threads}
                activeThread={conversation.activeThread}
                context={context}
                messages={conversation.messages}
                status={conversation.status}
                selectedMessageId={selectedMessageId}

                mobileView={mobileView}
                onMobileViewChange={setMobileView}

                sendDisabled={conversation.sendDisabled}
                navigationDisabled={conversation.navigationDisabled}

                historyLoading={conversation.historyLoading}
                historyError={conversation.historyError}
                onRetryHistory={conversation.reloadHistory}
                onCreateThread={openCreation}
                onRenameThread={conversation.renameThread}
                onDeleteThread={async (id) => {
                    const deletingActive = conversation.activeThread?.id === id;

                    await conversation.deleteThread(id);

                    if (deletingActive) {
                        setSelectedMessageId(null);
                        setMobileView("threads");
                    }
                }}

                mascot={
                    <MascotCanvas
                        state={conversation.mascotState}
                        onError={showError}
                    />
                }

                onSelectThread={selectThread}
                onSelectMessage={setSelectedMessageId}
                onSend={(text) => {
                    const sent = conversation.sendMessage(text);

                    if (sent) {
                        setSelectedMessageId(null);
                    }

                    return sent;
                }}

                canCancel={conversation.canCancel}
                cancelling={conversation.cancelling}
                pendingUserMessageId={conversation.pendingUserMessageId}
                onCancel={async () => {
                    setSelectedMessageId(null);
                    return conversation.cancelTurn();
                }}
            />

            {creationDialog}
            <ErrorToast
                toast={toast}
                onDismiss={dismissToast}
            />
        </div>
    );
}