import { useEffect, useRef, useState } from "react";

interface Props {
    creating: boolean;
    error: string | null;
    onCreate: (title: string, prompt: string) => Promise<boolean>;
    onClose: () => void;
}

export function ThreadCreationDialog({creating, error, onCreate, onClose,}: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const submittingRef = useRef(false);

    const [title, setTitle] = useState("");
    const [prompt, setPrompt] = useState("");

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const previousFocus = document.activeElement;
        dialog.showModal();

        return () => {
            dialog.close();

            if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
        };
    }, []);

    function closeDialog() {
        if (!submittingRef.current) onClose();
    }

    return (
        <dialog
            ref={dialogRef}
            className="cw-thread-dialog"
            aria-labelledby="thread-creation-title"
            aria-describedby="thread-creation-description"
            onCancel={(event) => {
                event.preventDefault();
                closeDialog();
            }}
        >
            <form
                aria-busy={creating}
                onSubmit={async (event) => {
                    event.preventDefault();

                    if (
                        submittingRef.current ||
                        !title.trim() ||
                        !prompt.trim()
                    ) {
                        return;
                    }

                    submittingRef.current = true;

                    try {
                        const created = await onCreate(title, prompt);

                        if (created) {
                            onClose();
                        }
                    } finally {
                        submittingRef.current = false;
                    }
                }}
            >
                <h2 id="thread-creation-title">Create a thread</h2>

                <p id="thread-creation-description">
                    Choose a topic for your conversation.
                </p>

                <label htmlFor="thread-name">Thread name</label>
                <input
                    id="thread-name"
                    name="title"
                    autoFocus
                    required
                    disabled={creating}
                    value={title}
                    placeholder="My day at school"
                    onChange={(event) => setTitle(event.target.value)}
                />

                <label htmlFor="thread-prompt">Thread prompt</label>
                <textarea
                    id="thread-prompt"
                    name="prompt"
                    required
                    rows={5}
                    disabled={creating}
                    value={prompt}
                    placeholder="I had an interesting day at school today. Let's talk about it!"
                    onChange={(event) => setPrompt(event.target.value)}
                />

                {error && (
                    <p className="cw-thread-error" role="alert">
                        {error}
                    </p>
                )}

                <div className="cw-thread-dialog-actions">
                    <button
                        type="button"
                        disabled={creating}
                        onClick={closeDialog}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={
                            creating ||
                            !title.trim() ||
                            !prompt.trim()
                        }
                    >
                        {creating ? "Creating…" : "Create thread"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
