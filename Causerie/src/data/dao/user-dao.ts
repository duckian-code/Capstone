import { callBackend } from "./base";
import type { User, UserSettings } from "../models/dao-types";

export class UserDAO {
    get(id: string): Promise<User | null> {
        return callBackend("get_user", { id });
    }

    list(): Promise<User[]> {
        return callBackend("list_users");
    }

    create(fields: Omit<User, "id">): Promise<User> {
        return callBackend("create_user", { fields });
    }

    update(user: User): Promise<number> {
        return callBackend("update_user", { user });
    }

    createIfMissing(user: User): Promise<User> {
        return callBackend("create_user_if_missing", { user });
    }

    saveProfile(user: User): Promise<User> {
        return callBackend("save_user_profile", { user });
    }

    saveIdentity(
        userId: string,
        displayName: string,
        pronouns: string,
        avatarDataUrl: string | null,
    ): Promise<void> {
        return callBackend("save_user_identity", {
            userId,
            displayName,
            pronouns,
            avatarDataUrl,
        });
    }

    saveTargetLanguage(userId: string, language: string): Promise<void> {
        return callBackend("save_user_target_language", {
            userId,
            language,
        });
    }

    delete(id: string): Promise<number> {
        return callBackend("delete_user", { id });
    }
}

export class UserSettingsDAO {
    get(userId: string): Promise<UserSettings | null> {
        return callBackend("get_user_settings", { userId });
    }

    save(value: UserSettings): Promise<void> {
        return callBackend("save_user_settings", { value });
    }
}