import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export interface AnnotationChoice {
    id: string;
    kind: "Sticky" | "Hint";
    phrase: string;
    preview: string;
    open: () => void;
}

interface Props {
    choices: AnnotationChoice[];
    onChoose: (choice: AnnotationChoice) => void;
    onDismiss: () => void;
}

export function AnnotationChooser({
                                      choices,
                                      onChoose,
                                      onDismiss,
                                  }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const previousFocus = useRef<HTMLElement | null>(null);
    const finished = useRef(false);
    const headingId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        finished.current = false;
        previousFocus.current =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        dialog.showModal();

        return () => {
            dialog.close();

            // do not steal focus from the annotation opened next
            if (!finished.current && previousFocus.current?.isConnected) {
                previousFocus.current.focus({ preventScroll: true });
            }
        };
    }, []);

    function finish(choice?: AnnotationChoice) {
        if (finished.current) return;
        finished.current = true;

        // Close this modal before opening the sticky or hint dialog.
        dialogRef.current?.close();

        if (previousFocus.current?.isConnected) {
            previousFocus.current.focus({ preventScroll: true });
        }

        if (choice) {
            onChoose(choice);
        } else {
            onDismiss();
        }
    }

    return createPortal(
        <dialog
            ref={dialogRef}
            className="annotation-chooser"
            aria-labelledby={headingId}
            onCancel={(event) => {
                event.preventDefault();
                finish();
            }}
            onClick={(event) => {
                if (event.target !== event.currentTarget) return;

                const bounds = event.currentTarget.getBoundingClientRect();
                const outside =
                    event.clientX < bounds.left ||
                    event.clientX > bounds.right ||
                    event.clientY < bounds.top ||
                    event.clientY > bounds.bottom;

                if (outside) finish();
            }}
        >
            <header className="annotation-chooser-header">
                <h2 id={headingId}>Open annotation</h2>

                <button
                    type="button"
                    className="annotation-chooser-close"
                    aria-label="Close annotation chooser"
                    onClick={() => finish()}
                >
                    ×
                </button>
            </header>

            <p className="annotation-chooser-help">
                This text has multiple annotations.
            </p>

            <ul className="annotation-chooser-list">
                {choices.map((choice, index) => (
                    <li key={choice.id}>
                        <button
                            type="button"
                            className="annotation-chooser-option"
                            autoFocus={index === 0}
                            onClick={() => finish(choice)}
                        >
                            <span className="annotation-chooser-kind">
                                {choice.kind}
                            </span>

                            <span className="annotation-chooser-phrase">
                                {choice.phrase}
                            </span>

                            <span className="annotation-chooser-preview">
                                {choice.preview}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </dialog>,
        document.body,
    );
}