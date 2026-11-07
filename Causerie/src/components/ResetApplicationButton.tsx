import { useRef, useState } from "react";
import { invoke } from "../services/recovery";
const development = import.meta.env.DEV;

export function ResetApplicationButton() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const runningRef = useRef(false);

    const [confirmation, setConfirmation] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function open() {
        setConfirmation("");
        setError(null);
        dialogRef.current?.showModal();
    }

    async function reset() {
        if (runningRef.current || confirmation !== "RESET") return;

        runningRef.current = true;
        setBusy(true);
        setError(null);

        try {
            // Development closes; package builds restart
            // Cleanup finishes during the next startup
            await invoke("reset_application", { confirmation });
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : String(reason),
            );

            runningRef.current = false;
            setBusy(false);
        }
    }

    return (
        <>
            <button
                className="reset-launcher"
                type="button"
                onClick={open}
            >
                Reset application
            </button>

            <dialog
                ref={dialogRef}
                className="reset-dialog"
                aria-labelledby="reset-title"
                onCancel={(event) => {
                    if (busy) event.preventDefault();
                }}
            >
                <h2 id="reset-title">Reset Causerie?</h2>

                <p>
                    This removes all local profiles, conversations,
                    goals, notes, settings, and stored credentials.
                    {" "}
                    {development
                        ? "The application will close. Launch it again to finish resetting and return to onboarding."
                        : "The application will restart into onboarding."}
                </p>

                <label htmlFor="reset-confirmation">
                    Type RESET to continue
                </label>

                <input
                    id="reset-confirmation"
                    value={confirmation}
                    disabled={busy}
                    autoComplete="off"
                    onChange={(event) =>
                        setConfirmation(event.currentTarget.value)
                    }
                />

                {error && <p role="alert">{error}</p>}

                <div className="reset-actions">
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => dialogRef.current?.close()}>
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={busy || confirmation !== "RESET"}
                        onClick={() => {
                            void reset();
                        }}>
                        {busy
                            ? development
                                ? "Closing…"
                                : "Restarting…"
                            : development
                                ? "Reset and close"
                                : "Delete data and restart"}
                    </button>
                </div>
            </dialog>
        </>
    );
}
