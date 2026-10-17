import { BaseDAO, nowIso } from "./base";

export interface AppState {
    id: number;
    active_user_id: string;
    onboarding_completed_at: string;
}

export class AppStateDAO extends BaseDAO {
    get() {
        return this.one<AppState>(
            "SELECT * FROM app_state WHERE id = 1",
            [],
        );
    }

    async completeOnboarding(userId: string): Promise<void> {
        await this.write(
            `INSERT INTO app_state (
                id,
                active_user_id,
                onboarding_completed_at
            )
            VALUES (1, $1, $2)
            ON CONFLICT(id) DO UPDATE SET
                active_user_id = excluded.active_user_id,
                onboarding_completed_at =
                    excluded.onboarding_completed_at`,
            [userId, nowIso()],
        );
    }
}