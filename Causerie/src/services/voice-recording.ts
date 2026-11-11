export interface Recording {
    result: Promise<Blob | null>;
    finish: () => void;
}

function wav(chunks: Float32Array[], sampleRate: number): Blob {
    const count = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const buffer = new ArrayBuffer(44 + count * 2);
    const view = new DataView(buffer);

    function text(offset: number, value: string) {
        for (let i = 0; i < value.length; i++) {
            view.setUint8(offset + i, value.charCodeAt(i));
        }
    }

    text(0, "RIFF");
    view.setUint32(4, 36 + count * 2, true);
    text(8, "WAVE");
    text(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    text(36, "data");
    view.setUint32(40, count * 2, true);

    let offset = 44;
    for (const chunk of chunks) {
        for (const sample of chunk) {
            const value = Math.max(-1, Math.min(1, sample));
            view.setInt16(offset, value * (value < 0 ? 32768 : 32767), true);
            offset += 2;
        }
    }

    return new Blob([buffer], { type: "audio/wav" });
}

export async function startRecording(
    automatic: boolean,
    signal: AbortSignal,
): Promise<Recording> {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is unavailable in this webview.");
    }

    if (signal.aborted) {
        throw new DOMException("Cancelled", "AbortError");
    }

    let stream: MediaStream;

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                channelCount: 1,
            },
        });
    } catch (error) {
        if (signal.aborted) {
            throw new DOMException("Cancelled", "AbortError");
        }

        const name = error instanceof DOMException
            ? error.name
            : "UnknownError";

        switch (name) {
            case "NotAllowedError":
                throw new Error(
                    "Microphone access was denied (NotAllowedError). " +
                    "Check microphone permissions for Causerie in your " +
                    "system settings, then fully restart the app.",
                );

            case "NotFoundError":
                throw new Error(
                    "No microphone was found (NotFoundError). " +
                    "Connect or enable an input device and try again.",
                );

            case "NotReadableError":
                throw new Error(
                    "The microphone could not be opened (NotReadableError). " +
                    "Check your selected input device and whether another " +
                    "application is using it.",
                );

            default:
                throw new Error(
                    `Unable to start microphone recording (${name}): ${
                        error instanceof Error ? error.message : String(error)
                    }`,
                );
        }
    }

    if (signal.aborted) {
        stream.getTracks().forEach((track) => track.stop());
        throw new DOMException("Cancelled", "AbortError");
    }

    const context = new AudioContext({ sampleRate: 24000 });

    try {
        await context.resume();
        await context.audioWorklet.addModule(
            `${import.meta.env.BASE_URL}voice-recorder-worklet.js`,
        );
    } catch (error) {
        stream.getTracks().forEach((track) => track.stop());
        await context.close();
        throw error;
    }

    if (signal.aborted) {
        stream.getTracks().forEach((track) => track.stop());
        await context.close();
        throw new DOMException("Cancelled", "AbortError");
    }

    const source = context.createMediaStreamSource(stream);
    const node = new AudioWorkletNode(context, "voice-recorder");
    const muted = context.createGain();
    muted.gain.value = 0;

    source.connect(node);
    node.connect(muted);
    muted.connect(context.destination);

    const chunks: Float32Array[] = [];
    const started = performance.now();
    let lastSpeech = started;
    let voicedMilliseconds = 0;
    let done = false;
    let finishing = false;
    let timer = 0;

    let resolve!: (value: Blob | null) => void;
    let reject!: (reason: unknown) => void;
    const result = new Promise<Blob | null>((yes, no) => {
        resolve = yes;
        reject = no;
    });

    function cleanup() {
        window.clearInterval(timer);
        signal.removeEventListener("abort", abort);
        stream.getTracks().forEach((track) => track.stop());
        source.disconnect();
        node.disconnect();
        muted.disconnect();
        void context.close();
    }

    function complete(cancelled = false) {
        if (done) return;
        done = true;
        cleanup();

        resolve(
            cancelled || voicedMilliseconds < 250
                ? null
                : wav(chunks, context.sampleRate),
        );
    }

    function abort() {
        complete(true);
    }

    function finish() {
        if (done || finishing) return;
        finishing = true;
        node.port.postMessage("finish");
    }

    node.port.onmessage = (event) => {
        if (done) return;

        if (event.data.done) {
            complete();
            return;
        }

        const samples = event.data.samples as Float32Array;
        if (!samples?.length) return;

        chunks.push(samples);

        const energy = samples.reduce((sum, sample) => sum + sample * sample, 0);
        const rms = Math.sqrt(energy / samples.length);

        if (rms >= 0.015) {
            lastSpeech = performance.now();
            voicedMilliseconds += samples.length / context.sampleRate * 1000;
        }
    };

    node.onprocessorerror = () => {
        if (done) return;
        done = true;
        cleanup();
        reject(new Error("Microphone processing stopped unexpectedly."));
    };

    signal.addEventListener("abort", abort, { once: true });

    timer = window.setInterval(() => {
        const now = performance.now();

        if (signal.aborted) {
            abort();
        } else if (
            now - started >= 60000 ||
            (voicedMilliseconds < 250 && now - started >= 12000) ||
            (automatic && voicedMilliseconds >= 250 && now - lastSpeech >= 1600)
        ) {
            finish();
        }
    }, 100);

    return { result, finish };
}

export async function blobBase64(blob: Blob): Promise<string> {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";

    for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }

    return btoa(binary);
}

export function audioBlob(encoded: string): Blob {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new Blob([bytes], { type: "audio/mpeg" });
}

export function playAudio(blob: Blob, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        let settled = false;

        function settle(error?: unknown) {
            if (settled) return;
            settled = true;
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
            URL.revokeObjectURL(url);
            signal.removeEventListener("abort", abort);
            if (error) reject(error);
            else resolve();
        }

        function abort() {
            settle(new DOMException("Cancelled", "AbortError"));
        }

        audio.onended = () => settle();
        audio.onerror = () => settle(new Error("Audio playback failed."));
        signal.addEventListener("abort", abort, { once: true });

        if (signal.aborted) abort();
        else void audio.play().catch(settle);
    });
}