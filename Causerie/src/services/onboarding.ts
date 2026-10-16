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
    
}