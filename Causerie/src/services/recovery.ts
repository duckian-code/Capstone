import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import { parseCommandError } from "./command-error";
import type { CommandError } from "./command-error";

interface Guidance {
    title: string;
    instructions: string;
    action?: "key" | "billing" | "limits";
}

const catalog: Record<string, Guidance> = {
    api_key_missing: {
        title: "Add your API key",
        instructions:
            "Open Settings and add your OpenAI API key. Then return to the unfinished operation and retry.",
        action: "key",
    },
    api_key_invalid: {
        title: "Your API key was rejected",
        instructions:
            "Replace your key in Settings. Check that it belongs to the intended API project and has not been revoked.",
        action: "key",
    },
    api_authentication: {
        title: "API authentication failed",
        instructions:
            "Check your API key and account access. This can also involve organization membership or project restrictions.",
        action: "key",
    },
    api_access_denied: {
        title: "API access is restricted",
        instructions:
            "Review your key’s permissions and project access. If you do not manage the project, ask its owner for help.",
        action: "key",
    },
    api_credits_exhausted: {
        title: "API credits are exhausted",
        instructions:
            "Review your API billing balance and add credits if appropriate. Repeated retries will not restore access.",
        action: "billing",
    },
    api_spend_limit: {
        title: "An API spending limit was reached",
        instructions:
            "Review your organization or project spending limit. An account owner may need to change it.",
        action: "limits",
    },
    api_quota_exceeded: {
        title: "Your API quota needs attention",
        instructions:
            "Review your API billing and usage limits. Restore account access before retrying.",
        action: "limits",
    },
    api_rate_limited: {
        title: "Please wait before retrying",
        instructions:
            "The service is limiting request traffic. Wait before using Retry, and avoid repeatedly submitting the same operation.",
    },
    api_limit_unknown: {
        title: "An API limit was reached",
        instructions:
            "This response did not identify whether the limit is temporary or account-related. Check billing and usage limits; if those are available, wait before retrying.",
        action: "limits",
    },
    connection_failed: {
        title: "Could not connect",
        instructions:
            "Check your internet connection. If you use a VPN, proxy, or firewall, check whether it permits access to the service. Then retry.",
    },
    request_timed_out: {
        title: "The request timed out",
        instructions:
            "Wait briefly, then retry the unfinished operation. Causerie will not automatically send another request.",
    },
    service_unavailable: {
        title: "The AI service is unavailable",
        instructions:
            "The service could not complete the request. Wait and retry later.",
    },
    credential_store_unavailable: {
        title: "Secure storage is unavailable",
        instructions:
            "Unlock your operating system’s credential store if prompted. If the problem continues, check that a supported credential store is available.",
    },
    storage_failure: {
        title: "Local work could not be saved",
        instructions:
            "Check available disk space and application storage permissions. Keep this window open and copy important text before restarting.",
    },
    interrupted_work: {
        title: "An unfinished conversation was recovered",
        instructions:
            "Use Retry to continue the saved turn, or Cancel to remove the pending turn and return its text to the composer.",
    },
    api_failure: {
        title: "The AI request could not finish",
        instructions:
            "Retry the unfinished operation once. If it continues failing, keep the diagnostic code below when reporting the problem.",
    },
    system_failure: {
        title: "Causerie could not complete this action",
        instructions:
            "Return to the affected feature and retry if it offers a retry action. If the problem repeats, report the diagnostic code below. Resetting the app is not required.",
    },
    input_language: {
        title: "Use your target language",
        instructions:
            "Cancel the unfinished turn to return its text to the composer, then rewrite most of it in your target language. English substitutions for unfamiliar words are welcome.",
    },
};

export function guidanceFor(code: string): Guidance {
    return catalog[code] ?? catalog.system_failure;
}

export interface RecoveryIssue {
    id: number;
    source: string;
    error: CommandError;
}

let issues: RecoveryIssue[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

function emit() {
    for (const listener of listeners) listener();
}

export function subscribeRecovery(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function getRecoveryIssues() {
    return issues;
}

export function reportIssue(source: string, cause: unknown) {
    const error = parseCommandError(cause);
    if (error.code === "request_cancelled") return;

    const existing = issues.find((item) => item.source === source);

    // Background polling must not reopen the same error repeatedly
    if (existing?.error.code === error.code) return;

    issues = [
        ...issues.filter((item) => item.source !== source),
        { id: ++nextId, source, error },
    ];

    emit();
}

export function clearIssue(source: string) {
    const next = issues.filter((item) => item.source !== source);
    if (next.length === issues.length) return;

    issues = next;
    emit();
}

export async function invoke<T>(
    command: string,
    args?: Record<string, unknown>,
): Promise<T> {
    try {
        const result = await tauriInvoke<T>(command, args);
        clearIssue(command);
        return result;
    } catch (cause) {
        let error = parseCommandError(cause);

        // These legacy commands still return plain strings
        if (
            error.code === "system_failure" &&
            (
                command === "save_openai_api_key" ||
                command === "has_openai_api_key"
            )
        ) {
            error = {
                kind: "app",
                code: "credential_store_unavailable",
                message: "Secure credential storage is unavailable.",
            };
        }

        reportIssue(command, error);

        // Preserve normal feature-level recovery and input state
        throw error;
    }
}