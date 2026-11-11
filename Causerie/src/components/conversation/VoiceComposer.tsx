import { useEffect, useRef, useState } from "react";
import type { ConversationMessage } from "../../data/models/conversation-types";
import { invoke } from "../../services/recovery";
import { parseCommandError } from "../../services/command-error";
import {
    audioBlob,
    blobBase64,
    playAudio,
    startRecording,
} from "../../services/voice-recording";
import type { Recording } from "../../services/voice-recording";

interface Props {
    threadId: string;
    language: string;
    live: boolean;
    disabled: boolean;
    canCancel: boolean;
    cancelling: boolean;
    messages: ConversationMessage[];
    onSend: (text: string) => Promise<ConversationMessage>;
    onCancel: () => Promise<string | null>;
}

interface Transcript {
    text: string;
    end_session: boolean;
    accepted: boolean;
    message: string | null;
}

type Stage =
    | "off"
    | "ready"
    | "permission"
    | "listening"
    | "transcribing"
    | "thinking"
    | "preparing"
    | "speaking"
    | "stopping";

const labels: Record<Stage, string> = {
    off: "Voice session stopped.",
    ready: "Ready for your next voice message.",
    permission: "Opening microphone…",
    listening: "Listening…",
    transcribing: "Transcribing and checking your message…",
    thinking: "Dot is preparing a reply…",
    preparing: "Preparing Dot’s voice…",
    speaking: "Dot is speaking…",
    stopping: "Stopping…",
};

export function VoiceComposer(props: Props) {
    const [stage, setStage] = useState<Stage>("off");
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState("");

    const latest = useRef(props);
    latest.current = props;

    const mounted = useRef(false);
    const active = useRef(false);
    const generation = useRef(0);
    const controller = useRef<AbortController | null>(null);
    const recording = useRef<Recording | null>(null);
    const running = useRef(false);
    const waitingForReply = useRef(false);
    const stopping = useRef(false);

    const cachedAudio = useRef<{
        messageId: string;
        blobs: Blob[];
    } | null>(null);

    function valid(id: number) {
        return mounted.current &&
            active.current &&
            id === generation.current &&
            !controller.current?.signal.aborted;
    }

    function status(next: Stage) {
        if (mounted.current) setStage(next);
    }

    function pause(reason?: unknown) {
        active.current = false;
        generation.current++;
        controller.current?.abort();
        recording.current = null;
        running.current = false;

        if (mounted.current) {
            setStage("off");
            if (reason) setError(parseCommandError(reason).message);
        }
    }

    async function endSession() {
        if (stopping.current) return;
        stopping.current = true;

        const cancelTurn = waitingForReply.current;
        pause();
        status("stopping");

        try {
            if (cancelTurn) {
                const restored = await latest.current.onCancel();
                if (mounted.current && restored !== null) setTranscript(restored);
                if (restored === null) {
                    throw new Error(
                        "The pending turn could not be cancelled. Use Cancel pending turn to retry.",
                    );
                }
            }
        } catch (reason) {
            if (mounted.current) setError(parseCommandError(reason).message);
        } finally {
            stopping.current = false;
            status("off");
        }
    }

    useEffect(() => {
        mounted.current = true;

        function hidden() {
            if (document.hidden) void endSession();
        }

        document.addEventListener("visibilitychange", hidden);

        return () => {
            mounted.current = false;
            active.current = false;
            generation.current++;
            controller.current?.abort();
            document.removeEventListener("visibilitychange", hidden);

            // Do not silently delete a persisted turn on unmount
            // Existing controller recovery retains unfinished work
        };
    }, []);

    async function speak(messageId: string, id: number) {
        status("preparing");

        let blobs = cachedAudio.current?.messageId === messageId
            ? cachedAudio.current.blobs
            : null;

        if (!blobs) {
            const encoded = await invoke<string[]>("speak_message", {
                threadId: latest.current.threadId,
                messageId,
                language: latest.current.language,
            });

            if (!valid(id)) return;

            blobs = encoded.map(audioBlob);
            cachedAudio.current = { messageId, blobs };
        }

        status("speaking");

        for (const blob of blobs) {
            if (!valid(id)) return;
            await playAudio(blob, controller.current!.signal);
        }
    }

    async function sendText(text: string, id: number) {
        status("thinking");
        waitingForReply.current = true;

        let reply: ConversationMessage;
        try {
            reply = await latest.current.onSend(text);
        } finally {
            waitingForReply.current = false;
        }

        if (!valid(id)) return;
        await speak(reply.id, id);

        if (valid(id)) setTranscript("");
    }

    async function capture(id: number) {
        while (valid(id)) {
            status("permission");
            const current = await startRecording(
                latest.current.live,
                controller.current!.signal,
            );

            if (!valid(id)) return;

            recording.current = current;
            status("listening");

            const blob = await current.result;
            recording.current = null;

            if (!valid(id)) return;

            if (!blob) {
                pause(new Error("No speech detected. Start again when you’re ready."));
                return;
            }

            status("transcribing");
            const encoded = await blobBase64(blob);
            if (!valid(id)) return;

            const result = await invoke<Transcript>("transcribe_voice", {
                threadId: latest.current.threadId,
                language: latest.current.language,
                audio: encoded,
            });

            if (!valid(id)) return;

            setTranscript(result.text);

            if (result.end_session) {
                pause();
                return;
            }

            if (!result.accepted) {
                pause(new Error(result.message ?? "Please revise your message."));
                return;
            }

            await sendText(result.text, id);
            if (!valid(id)) return;

            if (!latest.current.live) {
                status("ready");
                return;
            }

            // The microphone has been released throughout generation/playback
            // A new recording starts only after all audio has finished playing
        }
    }

    async function begin(
        action: "start" | "record" | "edited" | "replay",
    ) {
        if (running.current || stopping.current || latest.current.disabled) return;

        running.current = true;
        setError(null);

        if (!active.current) {
            active.current = true;
            controller.current = new AbortController();
            generation.current++;
        }

        const id = generation.current;

        try {
            if (action === "edited") {
                const result = await invoke<{
                    decision: "accepted" | "rejected" | "uncertain";
                    message: string | null;
                }>("validate_user_language", {
                    threadId: latest.current.threadId,
                    language: latest.current.language,
                    text: transcript,
                });

                if (!valid(id)) return;
                if (result.decision === "rejected") {
                    throw new Error(result.message ?? "Please revise your message.");
                }

                await sendText(transcript, id);
                if (!valid(id)) return;

                if (latest.current.live) await capture(id);
                else status("ready");
            } else if (action === "start" || action === "replay") {
                const previous = [...latest.current.messages]
                    .reverse()
                    .find((message) => message.role === "assistant");

                if (previous) await speak(previous.id, id);
                if (!valid(id)) return;

                if (action === "start" && latest.current.live) await capture(id);
                else status("ready");
            } else {
                await capture(id);
            }
        } catch (reason) {
            if (valid(id)) pause(reason);
        } finally {
            // An older cancelled operation must not unlock a newer session.
            if (id === generation.current) running.current = false;
        }
    }

    async function cancelPending() {
        if (stopping.current) return;
        stopping.current = true;
        pause();
        status("stopping");

        try {
            const restored = await props.onCancel();
            if (restored !== null) {
                setTranscript(restored);
                setError(null);
            } else {
                setError("Cancellation did not finish. Please try again.");
            }
        } finally {
            stopping.current = false;
            status("off");
        }
    }

    const idle = stage === "off" || stage === "ready";
    const hasReply = props.messages.some((message) => message.role === "assistant");

    return (
        <section className="cw-composer" aria-label="Voice conversation">
            <strong>Voice conversation · Marin</strong>
            <p role="status">{labels[stage]}</p>

            <small>
                Dot’s voice is AI-generated.{" "}
                {props.live
                    ? "Live mode listens again after Dot finishes."
                    : "Record and send each turn when you’re ready."}
            </small>

            <small>
                To end, say “end conversation”, “au revoir”, or
                “terminar la conversación”, or use End session.
            </small>

            {error && <p className="spelling-error" role="alert">{error}</p>}

            {transcript && (
                <label>
                    Your transcript
                    <textarea
                        value={transcript}
                        readOnly={!idle}
                        onChange={(event) => setTranscript(event.target.value)}
                        rows={3}/>
                </label>
            )}

            <div className="cw-composer-footer">
                {stage === "off" && (
                    <button
                        type="button"
                        disabled={props.disabled || stopping.current}
                        onClick={() => void begin("start")}>
                        Start voice session
                    </button>
                )}

                {idle && (
                    <button
                        type="button"
                        disabled={props.disabled}
                        onClick={() => void begin("record")}>
                        Record voice message
                    </button>
                )}

                {stage === "listening" && (
                    <button
                        type="button"
                        onClick={() => recording.current?.finish()}>
                        Send recording
                    </button>
                )}

                {idle && transcript.trim() && (
                    <button
                        type="button"
                        disabled={props.disabled || transcript.length > 1000}
                        onClick={() => void begin("edited")}>
                        Send edited transcript
                    </button>
                )}

                {idle && hasReply && (
                    <button
                        type="button"
                        disabled={props.disabled}
                        onClick={() => void begin("replay")}>
                        Play latest reply
                    </button>
                )}

                {stage !== "off" && (
                    <button
                        type="button"
                        disabled={stage === "stopping"}
                        onClick={() => void endSession()}>
                        End session
                    </button>
                )}

                {props.canCancel && idle && (
                    <button
                        type="button"
                        disabled={props.cancelling}
                        onClick={() => void cancelPending()}>
                        Cancel pending turn
                    </button>
                )}
            </div>
        </section>
    );
}