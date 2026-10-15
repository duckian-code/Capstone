export interface CommandError {
    kind: "openai" | "app";
    message: string;
}

export function parseCommandError(error: unknown): CommandError {
    // tauri may reject with a structured object
    // convert structured object to CommandError
    if (error instanceof Error) {
        return { kind: "app", message: error.message };
    }
    if (
        typeof error === "object"
        && error !== null
        && "kind" in error
        && "message" in error
        && (error.kind === "openai" || error.kind === "app")
        && typeof error.message === "string"
    ) {
        return error as CommandError;
    }
    // convert JSON-stringified command errors
    if (typeof error === "string") {
        try {
            return parseCommandError(JSON.parse(error));
        } catch {
            return { kind: "app", message: error };
        }
    }

    return { kind: "app", message: String(error) };
}