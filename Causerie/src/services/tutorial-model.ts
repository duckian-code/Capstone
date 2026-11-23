export const LESSONS = [
    "translation",
    "teacher",
    "hint",
    "sticky",
    "goals",
    "reminders",
    "spelling",
    "profile",
    "settings",
    "voice",
] as const;
export type Lesson = typeof LESSONS[number];
export type Outcome = 'pending' | 'completed' | 'skipped';
export interface TutorialProgress {
    version: 1;
    steps: Record<Lesson, Outcome>;
    exchanges: number;
    lastResolved: number;
    // ID deduplication prevents retries/history reloads from advancing the tour.
    exchangeIds: string[];
    noticeSeen: boolean;
    firstUserMessageId?: string;
}
export function initialProgress(legacy = false): TutorialProgress {
    return { version: 1, steps: Object.fromEntries(LESSONS.map(id => [id, legacy ? 'skipped' : 'pending'])) as Record<Lesson, Outcome>, exchanges: 0, lastResolved: 0, exchangeIds: [], noticeSeen: legacy };
}
export function parseProgress(raw: string): TutorialProgress {
    const value = JSON.parse(raw) as TutorialProgress;
    if (value.version !== 1 || !LESSONS.every(id => ['pending','completed','skipped'].includes(value.steps?.[id])) ||
        !Number.isSafeInteger(value.exchanges) || value.exchanges < 0 || !Number.isSafeInteger(value.lastResolved) ||
        value.lastResolved < 0 || value.lastResolved > value.exchanges || !Array.isArray(value.exchangeIds) ||
        !value.exchangeIds.every(id => typeof id === 'string') || typeof value.noticeSeen !== 'boolean') {
        throw new Error('Tutorial progress could not be read. Retry without resetting your progress.');
    }
    return value;
}
export function nextLesson(state: TutorialProgress): Lesson | undefined { return LESSONS.find(id => state.steps[id] === 'pending'); }
export function settle(state: TutorialProgress, id: Lesson, outcome: Exclude<Outcome, 'pending'>): TutorialProgress {
    if (state.steps[id] !== 'pending') return state;
    return { ...state, steps: { ...state.steps, [id]: outcome }, lastResolved: state.exchanges };
}
export function exchange(state: TutorialProgress, id: string): TutorialProgress {
    if (state.exchangeIds.includes(id) || !nextLesson(state)) return state;
    return { ...state, exchanges: state.exchanges + 1, exchangeIds: [...state.exchangeIds.slice(-2047), id] };
}
export function eligible(state: TutorialProgress): boolean {
    const next = nextLesson(state);

    if (!next) return false;

    if (next === "translation" && state.lastResolved === 0) {
        return true;
    }

    // Offer help immediately after translation succeeds or is skipped
    // TutorialPanel still waits until dialogs and other interactions finish
    if (
        next === "teacher" &&
        state.steps.translation !== "pending"
    ) {
        return true;
    }

    const gap =
        next === "goals" || next === "reminders" ? 2 : 1;

    return state.exchanges - state.lastResolved >= gap;
}
export const LABELS: Record<Lesson, string> = {
    translation: 'Translate a word', hint: 'Understand a phrase', teacher: 'Get help with a reply', sticky: 'Keep a useful note',
    goals: 'Choose a learning goal', reminders: 'Set a practice reminder', spelling: 'Check spelling', profile: 'User settings', settings: 'Application settings', voice: 'Explore vocal threads',
};