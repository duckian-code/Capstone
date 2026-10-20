import {LearningContext} from "../../data/models/conversation-types.ts";
import {useConversationController} from "../../hooks/useConversationController.ts";
import {useCallback, useState} from "react";
import {ErrorToast, Toast} from "../ErrorToast.tsx";
import {ConversationWorkspace} from "./ConversationWorkspace.tsx";
import {MascotCanvas} from "../MascotCanvas.tsx";
import {ThreadCreationDialog} from "../ThreadCreationDialog.tsx";
import {StickyProvider} from "../sticky/StickyProvider.tsx";
import { AccountPanel } from "../settings/SettingsMenus.tsx";

interface Props {
    userId: string;
    context: LearningContext;
}

// remount session if user switching is implemented in the future
export function ConversationScreen(props: Props) {
    return (
        <StickyProvider key={props.userId} userId={props.userId}>
            <ConversationSession {...props} />
        </StickyProvider>
    );
}

function ConversationSession({ userId, context }: Props) {
    const conversation = useConversationController(userId);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [creationOpen, setCreationOpen] = useState(false);

    function openCreation() {
        if (conversation.navigationDisabled) return;

        conversation.clearCreationError();
        setCreationOpen(true);
    }

    const creationDialog = creationOpen ? (
        <ThreadCreationDialog
            creating={conversation.creatingThread}
            error={conversation.operationError}
            onCreate={async (title, prompt) => {
                const created = await conversation.createThread(title, prompt);

                if (created) {
                    setSelectedMessageId(null);
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
            <main className="conversation-placeholder">
                <h1>Start practicing</h1>
                <p>Create your first conversation</p>

                <button type="button" disabled={conversation.creatingThread} onClick={openCreation}>
                        + New thread
                </button>

                <AccountPanel disabled={conversation.creatingThread} />

                {creationDialog}
            </main>
        );
    }

    const progressText = {
        idle: "",
        "saving-user": "Saving your message…",
        streaming: "Receiving a reply…",
        "saving-reply": "Saving the reply…",
        animating: "Displaying the reply…",
        failed: "",
    }[conversation.phase];

    return (
        <div className="conversation-screen">
            <div className="conversation-operation">
                <p role="status">{progressText}</p>

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

                sendDisabled={conversation.sendDisabled}
                navigationDisabled={conversation.navigationDisabled}

                historyLoading={conversation.historyLoading}
                historyError={conversation.historyError}
                onRetryHistory={conversation.reloadHistory}
                onCreateThread={openCreation}

                mascot={
                    <MascotCanvas
                        state={conversation.mascotState}
                        onError={showError}
                    />
                }

                onSelectThread={selectThread}
                onSelectMessage={setSelectedMessageId}
                onSend={conversation.sendMessage}
            />

            {creationDialog}
            <ErrorToast
                toast={toast}
                onDismiss={dismissToast}
            />
        </div>
    );
}