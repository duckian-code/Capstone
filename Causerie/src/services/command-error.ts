export interface CommandError {
    kind: "openai" | "app";
    code: string;
    message: string;
}

export function parseCommandError(error: unknown): CommandError {
    if (typeof error === "string") {
        try {
            const parsed: unknown = JSON.parse(error);

            if (typeof parsed === "object" && parsed !== null) {
                return parseCommandError(parsed);
            }
        } catch {
            // Legacy string error
        }

        return {
            kind: "app",
            code: "system_failure",
            message: error,
        };
    }

    if (typeof error === "object" && error !== null) {
        const value = error as Record<string, unknown>;

        if (
            (value.kind === "app" || value.kind === "openai") &&
            typeof value.message === "string"
        ) {
            return {
                kind: value.kind,
                code: typeof value.code === "string"
                    ? value.code
                    : "system_failure",
                message: value.message,
            };
        }
    }

    return {
        kind: "app",
        code: "system_failure",
        message: error instanceof Error
            ? error.message
            : "An unexpected application error occurred.",
    };
}