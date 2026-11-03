import { useState } from "react";
import { clearIssue, reportIssue } from "../services/recovery";

export function useStoredText(key: string) {
    const [text, setText] = useState(() => {
        try {
            return localStorage.getItem(key) ?? "";
        } catch {
            queueMicrotask(() => {
                reportIssue("draft_storage", {
                    kind: "app",
                    code: "storage_failure",
                    message: "The saved draft could not be loaded.",
                });
            });

            return "";
        }
    });

    function update(next: string) {
        // Retain it in memory even if local storage fails
        setText(next);

        try {
            if (next) {
                localStorage.setItem(key, next);
            } else {
                localStorage.removeItem(key);
            }

            clearIssue("draft_storage");
        } catch {
            reportIssue("draft_storage", {
                kind: "app",
                code: "storage_failure",
                message: "The draft is retained in this window but could not be saved.",
            });
        }
    }

    return [text, update] as const;
}