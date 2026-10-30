import { callBackend } from "../data/dao/base";

export const PROFICIENCY_LEVELS = [
    "A1", "A2", "B1", "B2", "C1", "C2",
] as const;

export type ProficiencyLevel = typeof PROFICIENCY_LEVELS[number];

export function isProficiencyLevel(
    value: string,
): value is ProficiencyLevel {
    return PROFICIENCY_LEVELS.some((level) => level === value);
}

export const proficiency = {
    get(userId: string): Promise<ProficiencyLevel> {
        return callBackend("get_proficiency", { userId });
    },

    save(
        userId: string,
        level: ProficiencyLevel,
    ): Promise<ProficiencyLevel> {
        return callBackend("save_proficiency", { userId, level });
    },
};