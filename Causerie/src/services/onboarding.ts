import { dal } from "../data/dal";
import type { User } from "../data/models/dao-types";
import {
    LANGUAGE_OPTIONS,
    PRONOUN_OPTIONS,
    type OnboardingInput,
} from "../data/models/onboarding-types";
import { callBackend } from "../data/dao/base";
import { initializeTutorial } from "./tutorial";
import { credentials } from "./credentials";

// TODO: REMOVE SINGLE PROFILE IDENTITY AFTER ONBOARDING TESTING
// separate user from causerie-dev-user
const LOCAL_USER_ID = "causerie-local-user";

export async function completeOnboarding(input: OnboardingInput): Promise<User & { avatarWarning?: string }> {
    const displayName = input.displayName.trim();
    const apiKey = input.apiKey.trim();

    // TODO: implement filtering on name inputs
    if (!displayName || displayName.length > 80) {
        throw new Error("Enter a name between 1 and 80 characters.");
    }

    if (!PRONOUN_OPTIONS.some(
        (option) => option.value === input.pronouns,
    )) {
        throw new Error("Select your pronouns.");
    }

    if (!LANGUAGE_OPTIONS.some(
        (option) => option.value === input.targetLanguage,
    )) {
        throw new Error("Select a supported language.");
    }

    if ((!apiKey && !await credentials.hasApiKey()) || apiKey.length > 8192 || /\s/.test(apiKey)) {
        throw new Error("Enter an API key without spaces.");
    }

    if (apiKey) await credentials.saveApiKey(apiKey);

    try {
        const user = await dal.users.saveProfile({
            id: LOCAL_USER_ID,
            display_name: displayName,
            pronouns:
            // IF WANTING TO INCLUDE PREFER NOT TO SAY
            // input.pronouns === "prefer-not-to-say"
            //                     ? null
            //                     : input.pronouns,
            input.pronouns,
            native_language: null,
            target_language: input.targetLanguage,
        });

        let avatarWarning: string | undefined;
        if (input.avatarDataUrl) {
            try { await dal.users.saveIdentity(user.id, displayName, input.pronouns, input.avatarDataUrl); }
            catch { avatarWarning = "Your profile picture could not be saved. You can add it later in User settings."; }
        }
        await callBackend("activate_onboarding_profile", { userId: user.id });
        await initializeTutorial(user.id);

        return { ...user, avatarWarning };
    } catch {
        throw new Error(
            "Your API key was saved, but setup could not finish. " +
            "Your profile may not be ready. " +
            "Retry to finish setup.",
        );
    }
}