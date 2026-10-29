import { ComponentType, Dispatch, SetStateAction } from "react";
import { LANGUAGE_OPTIONS } from "../../data/models/onboarding-types.ts";
import { Fragment } from "react";
import type { GoalDefinition, GoalSlots } from "../../data/models/goal-types.ts";
import type { ReminderSettings } from "../../services/reminders";

export interface SettingsDraft {
    targetLanguage: string;
    apiKey: string;
    goalSlots: GoalSlots;
    reminders: ReminderSettings | null;
}

export interface SettingsSectionProps {
    draft: SettingsDraft;
    setDraft: Dispatch<SetStateAction<SettingsDraft>>;
    goalOptions: GoalDefinition[];
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

function GoalsSection({draft, setDraft, goalOptions}: SettingsSectionProps) {
    return (
        <div className="settings-fields">
            <p id="settings-goals-help" className="settings-help">
                Choose up to three different goals. Any box can be
                left unselected. Retired goals can be kept or removed.
            </p>

            {draft.goalSlots.map((selectedId, index) => (
                <Fragment key={index}>
                    <label htmlFor={`settings-goal-${index}`}>
                        Goal {index + 1}
                    </label>

                    <select
                        id={`settings-goal-${index}`}
                        value={selectedId ?? ""}
                        aria-describedby="settings-goals-help"
                        onChange={(event) => {
                            const goalId =
                                event.currentTarget.value || null;

                            setDraft((previous) => {
                                if (
                                    goalId !== null &&
                                    previous.goalSlots.some(
                                        (id, otherIndex) =>
                                            otherIndex !== index &&
                                            id === goalId,
                                    )
                                ) {
                                    return previous;
                                }

                                const goalSlots: GoalSlots = [
                                    ...previous.goalSlots,
                                ];

                                goalSlots[index] = goalId;

                                return {
                                    ...previous,
                                    goalSlots,
                                };
                            });
                        }}
                    >
                        <option value="">No goal</option>

                        {goalOptions.map((goal) => (
                            <option
                                key={goal.id}
                                value={goal.id}
                                disabled={
                                    !goal.active ||
                                    draft.goalSlots.some(
                                        (id, otherIndex) =>
                                            otherIndex !== index &&
                                            id === goal.id,
                                    )
                                }
                            >
                                {goal.label}
                                {!goal.active && " (retired)"}
                            </option>
                        ))}
                    </select>
                </Fragment>
            ))}
        </div>
    );
}

function RemindersSection({ draft, setDraft }: SettingsSectionProps) {
    const settings = draft.reminders;

    if (!settings) {
        return (
            <p className="settings-help">
                Reminder settings have not loaded yet.
            </p>
        );
    }

    function update(patch: Partial<ReminderSettings>) {
        setDraft((previous) => ({
            ...previous,
            reminders: previous.reminders
                ? { ...previous.reminders, ...patch }
                : null,
        }));
    }

    return (
        <div className="settings-fields">
            <label className="settings-reminder-toggle">
                <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(event) => update({
                        enabled: event.currentTarget.checked,
                    })}
                />
                Remind me to practice with Dot
            </label>

            <label htmlFor="reminder-interval">Remind me every</label>
            <select
                id="reminder-interval"
                disabled={!settings.enabled}
                value={settings.every_days}
                onChange={(event) => update({
                    every_days: Number(event.currentTarget.value),
                })}
            >
                {Array.from({ length: 30 }, (_, index) => index + 1).map(
                    (days) => (
                        <option key={days} value={days}>
                            {days === 1 ? "Day" : `${days} days`}
                        </option>
                    ),
                )}
            </select>

            <label htmlFor="reminder-time">Local time</label>
            <input
                id="reminder-time"
                type="time"
                required={settings.enabled}
                disabled={!settings.enabled}
                value={settings.at_time}
                onChange={(event) => update({
                    at_time: event.currentTarget.value,
                })}
            />

            <label htmlFor="reminder-start">Starting on</label>
            <input
                id="reminder-start"
                type="date"
                required={settings.enabled}
                disabled={!settings.enabled}
                value={settings.start_date}
                onChange={(event) => update({
                    start_date: event.currentTarget.value,
                })}
            />

            <p className="settings-help">
                Dot will send a short message in your learning language,
                even when Causerie is closed. Reminders follow this
                computer’s local time while you’re signed in.
            </p>
        </div>
    );
}

export const SETTINGS_SECTIONS: SettingsSectionDefinition[] = [
    {
        id: "onboarding",
        label: "Onboarding",
        Component: OnboardingSection,
    },
    {
        id: "goals",
        label: "Learning goals",
        Component: GoalsSection,
    },
    {
        id: "reminders",
        label: "Practice reminders",
        Component: RemindersSection,
    },
]