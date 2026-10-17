import { useEffect, useRef, useState } from "react";

import type { User } from "../../data/models/dao-types";
import type { OnboardingInput } from "../../data/models/onboarding-types";
import { completeOnboarding } from "../../services/onboarding";
import { OnboardingForm } from "./OnboardingForm";

import "./onboarding.css";

interface Props {
    onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: Props) {
    const [savedUser, setSavedUser] = useState<User | null>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (savedUser) {
            headingRef.current?.focus();
        }
    }, [savedUser]);

    async function submit(input: OnboardingInput) {
        const user = await completeOnboarding(input);
        setSavedUser(user);
    }

    return (
        <main className="onboarding">
            <section
                className="onboarding-card"
                aria-labelledby="onboarding-title"
            >
                {savedUser ? (
                    <>
                        <h1
                            id="onboarding-title"
                            ref={headingRef}
                            tabIndex={-1}
                        >
                            You’re all set, {savedUser.display_name}!
                        </h1>

                        <p>
                            Your profile and API key have been saved.
                            Your target language is{" "}
                            {savedUser.target_language}.
                        </p>

                        <p>Your learning space is ready.</p>

                        <button type="button" onClick={onComplete}>
                            Start practicing
                        </button>

                    </>
                ) : (
                    <>
                        <h1 id="onboarding-title">
                            Welcome to Causerie
                        </h1>

                        <p>
                            Tell us how to address you and choose the
                            language you’d like to practice.
                        </p>

                        <OnboardingForm onSubmit={submit} />
                    </>
                )}
            </section>
        </main>
    );
}