import { callBackend } from "./base";

export interface AppState {
    id: number;
    active_user_id: string;
    onboarding_completed_at: string;
}

export class AppStateDAO {
    get(): Promise<AppState | null> {
        return callBackend("get_app_state");
    }

    completeOnboarding(userId: string): Promise<void> {
        return callBackend("complete_onboarding", { userId });
    }
}