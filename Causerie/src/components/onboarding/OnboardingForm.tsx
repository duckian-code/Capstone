import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
    LANGUAGE_OPTIONS,
    PRONOUN_OPTIONS,
    type OnboardingInput,
} from "../../data/models/onboarding-types";

interface Props {
    onSubmit: (input: OnboardingInput) => Promise<void>;
}

export function OnboardingForm({ onSubmit }: Props) {
    const id = useId();
    const submittingRef = useRef(false);

    const [displayName, setDisplayName] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [targetLanguage, setTargetLanguage] = useState("French");
    const [apiKey, setApiKey] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submittingRef.current) return;

        submittingRef.current = true;
        setSubmitting(true);
        setError(null);

        try {
            await onSubmit({
                displayName,
                pronouns,
                targetLanguage,
                apiKey,
            });
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Setup could not be completed. Please retry.",
            );
        } finally {
            // Do not keep the submitted secret in form state!
            setApiKey("");
            setShowKey(false);
            submittingRef.current = false;
            setSubmitting(false);
        }
    }

    return (
        <form className="onboarding-form" onSubmit={submit}>
            <fieldset disabled={submitting}>
                <legend>Your learning profile</legend>

                <label htmlFor={`${id}-name`}>Name</label>
                <input
                    id={`${id}-name`}
                    value={displayName}
                    onChange={(event) =>
                        setDisplayName(event.currentTarget.value)
                    }
                    autoComplete="given-name"
                    maxLength={80}
                    required
                />

                <label htmlFor={`${id}-pronouns`}>Pronouns</label>
                <select
                    id={`${id}-pronouns`}
                    value={pronouns}
                    onChange={(event) =>
                        setPronouns(event.currentTarget.value)
                    }
                    required
                >
                    <option value="" disabled>
                        Select pronouns
                    </option>

                    {PRONOUN_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <label htmlFor={`${id}-language`}>
                    Target language
                </label>
                <select
                    id={`${id}-language`}
                    value={targetLanguage}
                    onChange={(event) =>
                        setTargetLanguage(event.currentTarget.value)
                    }
                >
                    {LANGUAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <label htmlFor={`${id}-key`}>OpenAI API key</label>

                <div className="onboarding-key">
                    <input
                        id={`${id}-key`}
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(event) =>
                            setApiKey(event.currentTarget.value)
                        }
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        maxLength={8192}
                        aria-describedby={`${id}-key-help`}
                        required
                    />

                    <button
                        type="button"
                        aria-pressed={showKey}
                        onClick={() => setShowKey((value) => !value)}
                    >
                        {showKey ? "Hide" : "Show"}
                    </button>
                </div>

                <p id={`${id}-key-help`} className="onboarding-help">
                    Your key is stored locally in encrypted credential
                    storage. This step saves the key, but it does not verify
                    your OpenAI account access.
                </p>

                <button type="submit">
                    {submitting ? "Saving setup…" : "Save setup"}
                </button>
            </fieldset>

            {submitting && (
                <p role="status">
                    Saving your profile and credentials. Your operating
                    system may ask you to unlock its credential store.
                </p>
            )}

            {error && (
                <div role="alert">
                    <p>{error}</p>
                    <p>Re-enter your API key before retrying.</p>
                </div>
            )}
        </form>
    );
}