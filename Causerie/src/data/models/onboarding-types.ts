// TODO: evaluate unconventional pronouns (language specific?)
// TODO: evaluate potential option for prefer not to say individuals
export const PRONOUN_OPTIONS = [
    { value: "she/her", label: "She / her" },
    { value: "he/him", label: "He / him" },
    { value: "they/them", label: "They / them" },
    { value: "she/they", label: "She / they" },
    { value: "he/they", label: "He / they" },
    { value: "any", label: "Any pronouns" },
    // { value: "prefer-not-to-say", label: "Prefer not to say" },
] as const;

// TODO: Expanded support for other European/Western languages
// TODO: Add dialectical support (France, Canada, etc.)
// TODO: Add support for other native languages?
export const LANGUAGE_OPTIONS = [
    { value: "French", label: "French" },
] as const;

export interface OnboardingInput {
    displayName: string;
    pronouns: string;
    targetLanguage: string;
    apiKey: string;
}