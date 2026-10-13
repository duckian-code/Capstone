
import { useEffect, useRef, useState } from "react";

export function useTypewriter(
    speed = 40,
    onComplete?: () => void
) {
    const [displayed, setDisplayed] = useState("");

    const queue = useRef("");
    const streamingDone = useRef(false);
    const completionSent = useRef(false);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            if (queue.current.length > 0) {
                const charsPerTick = Math.max(1, Math.round(speed / 20));

                const next = queue.current.slice(0, charsPerTick);
                queue.current = queue.current.slice(charsPerTick);

                setDisplayed((previous) => previous + next);
            }

            if (
                streamingDone.current &&
                queue.current.length === 0 &&
                !completionSent.current
            ) {
                completionSent.current = true;
                onCompleteRef.current?.();
            }
        }, 50);

        return () => window.clearInterval(interval);
    }, [speed]);

    function append(text: string) {
        queue.current += text;
    }

    function reset() {
        queue.current = "";
        streamingDone.current = false;
        completionSent.current = false;
        setDisplayed("");
    }

    function finish() {
        streamingDone.current = true;
    }

    function cancel() {
        queue.current = "";
        streamingDone.current = false;
        completionSent.current = true;
    }

    return {
        displayed,
        append,
        reset,
        finish,
        cancel,
    };
}
