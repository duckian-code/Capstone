import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { openUrl } from "@tauri-apps/plugin-opener";

import { getRecoveryIssues, guidanceFor, subscribeRecovery } from "../services/recovery";

export function RecoveryCenter() {
    const issues = useSyncExternalStore(
        subscribeRecovery,
        getRecoveryIssues,
        getRecoveryIssues,
    );

    const [expanded, setExpanded] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const newestId = issues.reduce(
        (latest, issue) => Math.max(latest, issue.id),
        0,
    );

    useEffect(() => {
        if (newestId > 0) setExpanded(true);
    }, [newestId]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (expanded && issues.length > 0) {
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    }, [expanded, issues.length]);

    function minimize() {
        dialogRef.current?.close();
        setExpanded(false);
        setLinkError(null);
    }

    async function openAccountPage(url: string) {
        setLinkError(null);

        try {
            await openUrl(url);
        } catch {
            setLinkError(
                `Could not open your browser. Open this address manually: ${url}`,
            );
        }
    }

    function openKeySettings() {
        minimize();

        window.dispatchEvent(
            new Event("causerie:open-api-settings"),
        );
    }

    // Group account-wide failures into one explanation
    const groups = [...new Set(issues.map((issue) => issue.error.code))]
        .map((code) => ({
            code,
            guidance: guidanceFor(code),
            sources: issues
                .filter((issue) => issue.error.code === code)
                .map((issue) => issue.source),
        }));

    return createPortal(
        <>
            {issues.length > 0 && !expanded && (
                <button
                    type="button"
                    className="recovery-launcher"
                    onClick={() => setExpanded(true)}
                >
                    Action needed ({groups.length})
                </button>
            )}

            <dialog
                ref={dialogRef}
                className="recovery-dialog"
                aria-labelledby="recovery-heading"
                onCancel={(event) => {
                    event.preventDefault();
                    minimize();
                }}
            >
                <header className="recovery-header">
                    <h2 id="recovery-heading">Action needed</h2>

                    <button
                        type="button"
                        aria-label="Minimize error details"
                        onClick={minimize}
                    >
                        ×
                    </button>
                </header>

                <p>
                    Closing these details does not discard your unfinished work.
                    After fixing the problem, return to the affected feature
                    and use its Retry or submit button.
                </p>

                {groups.map(({ code, guidance, sources }) => (
                    <section className="recovery-item" key={code}>
                        <h3>{guidance.title}</h3>
                        <p>{guidance.instructions}</p>

                        <div className="recovery-actions">
                            {guidance.action === "key" && (
                                <button
                                    type="button"
                                    onClick={openKeySettings}
                                >
                                    Open API key settings
                                </button>
                            )}

                            {guidance.action === "billing" && (
                                <button
                                    type="button"
                                    onClick={() => void openAccountPage(
                                        "https://platform.openai.com/settings/organization/billing/overview",
                                    )}
                                >
                                    Open API billing
                                </button>
                            )}

                            {guidance.action === "limits" && (
                                <button
                                    type="button"
                                    onClick={() => void openAccountPage(
                                        "https://platform.openai.com/settings/organization/limits",
                                    )}
                                >
                                    Review API limits
                                </button>
                            )}
                        </div>

                        <details>
                            <summary>Diagnostic details</summary>
                            <pre>
                                {JSON.stringify({
                                    code,
                                    operations: sources,
                                }, null, 2)}
                            </pre>
                        </details>
                    </section>
                ))}

                {linkError && <p role="alert">{linkError}</p>}

                <button type="button" onClick={minimize}>
                    Return to my work
                </button>
            </dialog>
        </>,
        document.body,
    );
}