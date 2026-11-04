export const STICKY_CATEGORIES = [
    { id: "grammar", label: "Grammar" },
    { id: "vocabulary", label: "Vocabulary" },
    { id: "phrasing", label: "Phrasing" },
    { id: "pronunciation", label: "Pronunciation" },
    { id: "spelling", label: "Spelling" },
    { id: "idioms", label: "Idioms" },
    { id: "register", label: "Register" },
    { id: "cultural_context", label: "Cultural context" },
] as const;

export type StickyCategory =
    (typeof STICKY_CATEGORIES)[number]["id"];

export const MAX_STICKY_CATEGORIES = 3;

export function stickyCategoryLabel(category: StickyCategory): string {
    return STICKY_CATEGORIES.find((option) => option.id === category)
        ?.label ?? category;
}