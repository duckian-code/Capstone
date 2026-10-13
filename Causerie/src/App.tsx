import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Application, Assets, Sprite, Texture } from "pixi.js";
import { createActor, createMachine } from "xstate";
import type { ActorRefFrom } from "xstate";
import "./App.css";
import { useCallback } from "react";
import { Channel } from "@tauri-apps/api/core";
import { ErrorToast} from "./components/ErrorToast.tsx";
import type { Toast } from "./components/ErrorToast.tsx";
// import { info, debug, error } from "tauri-plugin-log-api";
import { useTypewriter } from "./hooks/useTypewriter.ts";

// WebKitGTK (the Linux Tauri WebView) does not reliably upload textures decoded
// through Pixi's worker/createImageBitmap path. Use the browser Image loader instead.
Assets.setPreferences({
    preferWorkers: false,
    preferCreateImageBitmap: false,
});

// TODO: either implement concurrent mascot states between threads or cancel and rollback active requests on thread change
const mascotMachine = createMachine({
    id: "mascot",
    initial: "idle",

    states: {
        idle: {
            on: { SUBMIT: "wait" },
        },

        wait: {
            on: { RESPONSE_STARTED: "respond", REQUEST_FAILED: "error", REQUEST_CANCELLED: "idle" },
        },

        respond: {
            on: { STREAM_DONE: "idle", REQUEST_FAILED: "error", REQUEST_CANCELLED: "idle" },
        },

        error: {
            after: { 5000: "idle" }, // after 5 seconds of displaying error, return to idle
            on: { SUBMIT: "wait" },
        },
    },
});

type MascotEvent =
    | { type: "SUBMIT" }
    | { type: "RESPONSE_STARTED" }
    | { type: "STREAM_DONE" }
    | { type: "REQUEST_FAILED" }
    | { type: "REQUEST_CANCELLED" };

// Error parsing from lib.rs
interface CommandError {
    kind: "openai" | "app";
    message: string;
}

function parseCommandError(error: unknown): CommandError {
    // tauri may reject with a structured object
    // convert structured object to CommandError
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

function App() {
    const mascotContainer = useRef<HTMLDivElement>(null);
    const mascotActor = useRef<ActorRefFrom<typeof mascotMachine> | null>(null);
    const [prompt, setPrompt] = useState("");

    // replaced response state with typewriter
    // const [response, setResponse] = useState("");
    const {
        displayed: response,
        append,
        reset,
        finish,
        cancel
    } = useTypewriter(40, () => {
        sendMascotEvent({ type: "STREAM_DONE" });
        setIsLoading(false);
    });

    const [toast, setToast] = useState<Toast | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const dismissToast = useCallback(() => setToast(null), []);
    const showError = useCallback((message: string) => {
        setToast({
            id: Date.now(),
            message,
        });
    }, []);

    useEffect(() => {
        const actor = createActor(mascotMachine);
        mascotActor.current = actor;
        actor.start();
        const app = new Application();
        let disposed = false;
        let initialized = false;
        let unsubscribe: (() => void) | undefined;

        async function initializeMascot() {
            await app.init({
                width: 400,
                height: 300,
                backgroundColor: 0x292c32,
            });
            initialized = true;

            if (disposed || !mascotContainer.current) {
                app.destroy(true);
                return;
            }

            mascotContainer.current.appendChild(app.canvas);

            const [idleTexture, respondTexture, waitTexture, errorTexture] = await Promise.all([
                Assets.load<Texture>("/assets/idle.png"),
                Assets.load<Texture>("/assets/respond.png"),
                Assets.load<Texture>("/assets/wait.png"),
                Assets.load<Texture>("/assets/error.png"),
            ]);

            const textures = {
                idle: idleTexture,
                respond: respondTexture,
                wait: waitTexture,
                error: errorTexture,
            }

            // expandable and dynamic instead of static assignment
            Object.values(textures).forEach((texture) => {
                texture.source.scaleMode = "nearest";
            })

            if (disposed) return;

            const mascot = new Sprite(idleTexture);
            mascot.anchor.set(0.5);
            mascot.position.set(200, 150);
            mascot.scale.set(0.3);
            app.stage.addChild(mascot);

            const subscription = actor.subscribe((snapshot) => {
                const state = snapshot.value as keyof typeof textures;
                mascot.texture =
                    textures[state] ?? idleTexture;
            });
            unsubscribe = () => subscription.unsubscribe();
        }

        initializeMascot().catch((reason) => {
            console.error("Unable to initialize mascot", reason);
            showError(`Mascot initialization failed: ${String(reason)}`);
        });

        return () => {
            disposed = true;
            unsubscribe?.();
            actor.stop();
            mascotActor.current = null;
            if (initialized) app.destroy(true);
        };
    }, []);

    function sendMascotEvent(event: MascotEvent) {
        mascotActor.current?.send(event);
    }

    type StreamEvent = {
        event: "chunk";
        data: {
            text: string;
        };
    };

    async function submitPrompt(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const message = prompt.trim();

        if (!message || isLoading) return;

        setIsLoading(true);
        reset();
        // setResponse("");
        sendMascotEvent({ type: "SUBMIT" });

        let hasStarted = false;

        // create channel for request
        const onEvent = new Channel<StreamEvent>();

        onEvent.onmessage = (event) => {
            if (event.event !== "chunk") return;

            if (!hasStarted) {
                hasStarted = true;
                sendMascotEvent({ type: "RESPONSE_STARTED" });
            }

            // typewriter hook response overhaul
            // setResponse((prev) => prev + event.data.text);
            append(event.data.text);
        }

        try {
            await invoke<void>("send_message", { message, onEvent });

            // sendMascotEvent({ type: "STREAM_DONE" });
            finish();
        } catch (reason) {
            cancel();

            const error = parseCommandError(reason);
            showError(error.message);

            sendMascotEvent({
                type: error.kind === "openai"
                    ? "REQUEST_FAILED"
                    : "REQUEST_CANCELLED",
            });

            setIsLoading(false);
        }
    }

    return (
        <main className="container">
            <h1>Causerie</h1>

            <div ref={mascotContainer} aria-label="Mascot status" />

            <form className="row" onSubmit={submitPrompt}>
                <input
                    id="prompt-input"
                    value={prompt}
                    onChange={(event) => setPrompt(event.currentTarget.value)}
                    placeholder="Enter a message..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !prompt.trim()}>
                    {isLoading ? "Generating..." : "Submit"}
                </button>
            </form>

            {response && <p>{response}</p>}
            <ErrorToast toast={toast} onDismiss={dismissToast} />
        </main>
    );
}

export default App;
