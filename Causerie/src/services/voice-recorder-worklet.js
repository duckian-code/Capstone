class VoiceRecorderProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = new Float32Array(2048);
        this.used = 0;

        this.port.onmessage = (event) => {
            if (event.data === "finish") {
                this.flush();
                this.port.postMessage({ done: true });
            }
        };
    }

    flush() {
        if (!this.used) return;
        const samples = this.buffer.slice(0, this.used);
        this.port.postMessage({ samples }, [samples.buffer]);
        this.used = 0;
    }

    process(inputs) {
        const channels = inputs[0];
        if (!channels?.length) return true;

        for (let i = 0; i < channels[0].length; i++) {
            let value = 0;
            for (const channel of channels) value += channel[i];
            this.buffer[this.used++] = value / channels.length;

            if (this.used === this.buffer.length) this.flush();
        }

        return true;
    }
}

registerProcessor("voice-recorder", VoiceRecorderProcessor);