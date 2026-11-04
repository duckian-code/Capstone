import {
    isPermissionGranted,
    requestPermission,
} from "@tauri-apps/plugin-notification";

import { callBackend } from "../data/dao/base.ts";

export interface ReminderSettings {
    enabled: boolean;
    every_days: number;
    at_time: string;
    start_date: string;
}

export interface ReminderView {
    settings: ReminderSettings;
    last_error: string | null;
}

export function remindersEqual(
    first: ReminderSettings | null,
    second: ReminderSettings | null,
): boolean {
    if (!first || !second) return first === second;

    return (
        first.enabled === second.enabled &&
        first.every_days === second.every_days &&
        first.at_time === second.at_time &&
        first.start_date === second.start_date
    );
}

export const reminders = {
    get(userId: string): Promise<ReminderView> {
        return callBackend("get_practice_reminders", { userId });
    },

    async save(
        userId: string,
        settings: ReminderSettings,
    ): Promise<ReminderView> {
        if (settings.enabled) {
            const granted = await isPermissionGranted();

            if (!granted && await requestPermission() !== "granted") {
                throw new Error(
                    "Allow Causerie notifications in your system settings " +
                    "before enabling practice reminders.",
                );
            }
        }

        return callBackend("save_practice_reminders", {
            userId,
            settings,
        });
    },
};