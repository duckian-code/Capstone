import { useEffect, useRef, useState } from "react";
import type { ConversationSummary } from "../../data/models/conversation-types";
import { parseCommandError } from "../../services/command-error";

interface Props {
    thread: ConversationSummary;
    disabled: boolean;
    onRename: (id: string, title: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

type Action = "rename" | "delete";

export function ThreadActions({thread, disabled, onRename, onDelete}: Props) {
    const [action, setAction] = useState<Action | null>(null);

    return (
        <>
            <div className="cw-thread-actions" aria-label="Thread actions">
                <button
                    type="button"
                    data-thread-action-focus
                    disabled={disabled}
                    aria-label={`Rename thread: ${thread.title}`}
                    onClick={() => setAction("rename")}
                >
                    Rename
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    aria-label={`Delete thread: ${thread.title}`}
                    onClick={() => setAction("delete")}
                >
                    Delete
                </button>
            </div>

            {action && (
                <ThreadActionDialog
                    action={action}
                    thread={thread}
                    onRename={onRename}
                    onDelete={onDelete}
                    onClose={() => setAction(null)}
                />
            )}
        </>
    );
}

function ThreadActionDialog({action, thread, onRename, onDelete, onClose}: {
    action: Action; thread: ConversationSummary; onRename: Props["onRename"]; onDelete: Props["onDelete"]; onClose: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const pending = useRef(false);
    const alive = useRef(false);

    const [title, setTitle] = useState(thread.title);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleting = action === "delete";

    useEffect(() => {
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;

        alive.current = true;
        dialog?.showModal();

        return () => {
            alive.current = false;
            dialog?.close();

            // Deleting the final thread removes the original trigger.
            window.requestAnimationFrame(() => {
                if (
                    previousFocus instanceof HTMLElement &&
                    previousFocus.isConnected &&
                    !previousFocus.matches(":disabled")
                ) {
                    previousFocus.focus({ preventScroll: true });
                } else {
                    document.querySelector<HTMLElement>(
                        "[data-thread-action-focus]",
                    )?.focus({ preventScroll: true });
                }
            });
        };
    }, []);

    function close() {
        if (!pending.current) onClose();
    }

    async function submit() {
        if (pending.current) return;

        const name = title.trim();

        if (!deleting && (!name || name.length > 100)) {
            setError("Enter a thread name between 1 and 100 characters.");
            return;
        }

        pending.current = true;
        setBusy(true);
        setError(null);

        try {
            if (deleting) {
                await onDelete(thread.id);
            } else {
                await onRename(thread.id, name);
            }

            if (alive.current) onClose();
        } catch (reason: unknown) {
            if (alive.current) {
                setError(parseCommandError(reason).message);
            }
        } finally {
            pending.current = false;

            if (alive.current) {
                setBusy(false);
            }
        }
    }

    return (
        <dialog
            ref={dialogRef}
            className="cw-thread-dialog"
            aria-labelledby="thread-action-title"
            aria-describedby={deleting ? "thread-delete-description" : undefined}
            onCancel={(event) => {
                event.preventDefault();
                close();
            }}
        >
            <form
                aria-busy={busy}
                onSubmit={(event) => {
                    event.preventDefault();
                    void submit();
                }}
            >
                <h2 id="thread-action-title">
                    {deleting ? "Delete this thread?" : "Rename thread"}
                </h2>

                {deleting ? (
                    <p id="thread-delete-description">
                        Permanently delete <strong>“{thread.title}”</strong> and
                        its messages, feedback, and saved hints?
                        This cannot be undone. Your stickies will be kept.
                    </p>
                ) : (
                    <>
                        <label htmlFor="thread-new-name">Thread name</label>
                        <input
                            id="thread-new-name"
                            autoFocus
                            required
                            maxLength={100}
                            disabled={busy}
                            value={title}
                            onFocus={(event) => event.currentTarget.select()}
                            onChange={(event) => {
                                setTitle(event.currentTarget.value);
                                setError(null);
                            }}
                        />
                    </>
                )}

                {error && (
                    <p className="cw-thread-error" role="alert">
                        {error}
                    </p>
                )}

                <div className="cw-thread-dialog-actions">
                    <button
                        type="button"
                        autoFocus={deleting}
                        disabled={busy}
                        onClick={close}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className={deleting ? "thread-action-delete" : undefined}
                        disabled={
                            busy ||
                            (!deleting && (
                                !title.trim() ||
                                title.trim() === thread.title
                            ))
                        }
                    >
                        {busy
                            ? deleting ? "Deleting…" : "Saving…"
                            : deleting ? "Delete thread" : "Save name"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}