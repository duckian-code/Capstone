import { dal } from "../data/dal";
import type { User } from "../data/models/dao-types";
import type { LearningContext } from "../data/models/conversation-types";
import { credentials } from "./credentials";
import { selectedGoalLabels, GoalSettings } from "../data/models/goal-types.ts";

export interface AppSession {
    user: User;
    context: LearningContext;
    goalSettings: GoalSettings;
}

// const DEFAULT_GOALS = [
//     "Learn new vocabulary",
//     "Improve grammar",
//     "Use idiomatic expressions",
//     "Use more specific/less generic expressions",
//     "Move away from blunt statements/expressions",
//     "Practice professional expressions",
//     "Practice casual expressions",
// ];

export async function loadAppSession(): Promise<AppSession | null> {
    await dal.initialize();

    const state = await dal.appState.get();

    if (!state) {
        return null;
    }

    const user = await dal.users.get(state.active_user_id);

    if (!user) {
        throw new Error("The saved active profile could not be found.");
    }

    // Missing credentials require setup.
    const hasApiKey = await credentials.hasApiKey();

    if (!hasApiKey) {
        return null;
    }

    const goalSettings = await dal.goals.forUser(user.id);

    return {
        user,
        goalSettings,
        context: {
            language: user.target_language ?? "French",
            goals: selectedGoalLabels(goalSettings),
        },
    };
}