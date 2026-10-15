import { dal } from "../data/dal"
import type { User } from "../data/models/dao-types"

const DEV_USER: User = {
    id: "causerie-dev-user",
    display_name: "Ariadne",
    pronouns: "elle/la",
    native_language: "English",
    target_language: "French",
}

export async function initializeDevSession() {
    const currentUser = await dal.users.createIfMissing(DEV_USER);

    const goals: string[] = [
        "Practice everyday vocabulary",
        "Use idiomatic tenses",
        "Build complete sentences",
    ];

    return {
        currentUser,
        goals,
    };
}