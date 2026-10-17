import { dal } from "../data/dal";
import type { User } from "../data/models/dao-types";
import {
    LANGUAGE_OPTIONS,
    PRONOUN_OPTIONS,
    type OnboardingInput,
} from "../data/models/onboarding-types";
import { credentials } from "./credentials";

// TODO: REMOVE SINGLE PROFILE IDENTITY AFTER ONBOARDING TESTING
// separate user from causerie-dev-user
const LOCAL_USER_ID = "causerie-local-user";

export async function completeOnboarding(input: OnboardingInput): Promise<User> {
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

    if (!apiKey || apiKey.length > 8192 || /\s/.test(apiKey)) {
        throw new Error("Enter an API key without spaces.");
    }

    await credentials.saveApiKey(apiKey);

    try {
        const user = await.users.saveProfile({
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

        await dal.appState.completeOnboarding(user.id);

        return user;
    } catch {
        throw new Error(
            "Your API key was saved, but your profile could not be saved. " +
            "Retry to finish setup.",
        );
    }
}