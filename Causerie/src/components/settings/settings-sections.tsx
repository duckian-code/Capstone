import { ComponentType, Dispatch, SetStateAction } from "react";
import { LANGUAGE_OPTIONS } from "../../data/models/onboarding-types.ts";

export interface SettingsDraft {
    targetLanguage: string;
    apiKey: string;
}

export interface SettingsSectionProps {
    draft: SettingsDraft;
    setDraft: Dispatch<SetStateAction<SettingsDraft>>;
}

export interface SettingsSectionDefinition {
    id: string;
    label: string;
    Component: ComponentType<SettingsSectionProps>;
}

function OnboardingSection({ draft, setDraft }: SettingsSectionProps) {
    return (
        <div className="settings-fields">
            <label htmlFor="settings-language">
                Target language
            </label>

            <select
                id="settings-language"
                value={draft.targetLanguage}
                onChange={(event) => {
                    const targetLanguage = event.currentTarget.value;

                    setDraft((previous) => ({
                        ...previous,
                        targetLanguage,
                    }));
                }}
            >
                {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <label htmlFor="settings-api-key">
                Replace API key
            </label>

            <input
                id="settings-api-key"
                type="password"
                value={draft.apiKey}
                placeholder="Leave blank to keep your saved key"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={8192}
                aria-describedby="settings-api-key-help"
                onChange={(event) => {
                    const apiKey = event.currentTarget.value;

                    setDraft((previous) => ({
                        ...previous,
                        apiKey,
                    }));
                }}
            />

            <p id="settings-api-key-help" className="settings-help">
                Your saved key is not displayed. Enter a new key only
                when you want to replace it.
            </p>
        </div>
    );
}

export const SETTINGS_SECTIONS: SettingsSectionDefinition[] = [
    {
        id: "onboarding",
        label: "Onboarding",
        Component: OnboardingSection,
    }
]