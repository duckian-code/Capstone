import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { LESSONS } from "../../services/tutorial-model.ts";
import { useTutorial } from "./TutorialProvider.tsx";

interface Props {
    messageId: string;
    available: boolean;
    unread: boolean;
    children: ReactNode;
}

export function FeedbackTutorialCue({ messageId, available, unread, children }: Props) {
    const store = useTutorial();
    const wrapperRef = useRef<HTMLSpanElement>(null);
    const [pulsing, setPulsing] = useState(false);

    const onboardingActive =
        !store.replaying &&
        !!store.state &&
        LESSONS.some(id => store.state!.steps[id] === "pending");

    const enabled =
        onboardingActive &&
        available &&
        unread &&
        !!messageId;

    useEffect(() => {
        if (!enabled) {
            setPulsing(false);
            return;
        }

        const button =
            wrapperRef.current?.querySelector<HTMLButtonElement>(
                "button",
            );

        if (!button) return;

        // Don't consume the one-time cue while the button is hidden in another mobile view or outside the scroll area
        const observer = new IntersectionObserver(
            entries => {
                if (!entries.some(entry => entry.isIntersecting)) {
                    return;
                }

                if (store.claimFeedbackCue()) {
                    setPulsing(true);
                }

                observer.disconnect();
            },
            { threshold: 0.5 },
        );

        observer.observe(button);

        return () => observer.disconnect();
    }, [enabled, messageId, store]);

    useEffect(() => {
        if (!pulsing) return;

        const timer = window.setTimeout(
            () => setPulsing(false),
            9000,
        );

        return () => window.clearTimeout(timer);
    }, [pulsing]);

    return (
        <span
            ref={wrapperRef}
            className="feedback-tutorial-cue"
            data-pulsing={pulsing && enabled ? "true" : undefined}>
            {children}
        </span>
    );
}