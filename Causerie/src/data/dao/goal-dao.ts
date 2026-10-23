import { invoke } from '@tauri-apps/api/core';
import { getDatabase } from '../database';
import type {
    GoalSettings,
    GoalSlots,
} from '../models/goal-types';

// GOAL DAO HOOKS UP TO BACKEND SQLX INSTEAD OF MAKING DIRECT CALLS
export class GoalDAO {
    async forUser(userId: string): Promise<GoalSettings> {
        await getDatabase();

        return invoke<GoalSettings>('get_goal_settings', {userId});
    }

    async saveSelection(userId: string, slots: GoalSlots): Promise<GoalSettings> {
        await getDatabase();

        return invoke<GoalSettings>('save_goal_settings', {userId, slots});
    }
}
