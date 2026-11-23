import { parseCommandError } from './command-error';
import { callBackend } from '../data/dao/base';
import { exchange, initialProgress, LESSONS, parseProgress, settle, type Lesson, type TutorialProgress } from './tutorial-model';

let owner = '';
let normal: TutorialProgress | null = null;
let replay: TutorialProgress | null = null;
let generation = 0;
let error: string | null = null;
let busy = 0;
let revision = 0;
let queue: Promise<void> = Promise.resolve();
const listeners = new Set<() => void>();
function notify() { revision++; listeners.forEach(fn => fn()); }
function persist() {
    if (!normal) return;
    const userId = owner, stateJson = JSON.stringify(normal);
    queue = queue.then(async () => {
        try { await callBackend('save_onboarding_progress', { userId, stateJson }); if (owner === userId) error = null; }
        catch (reason) { if (owner === userId) error = parseCommandError(reason).message; }
        notify();
    });
}
function update(fn: (state: TutorialProgress) => TutorialProgress) {
    const state = replay ?? normal;
    if (!state) return;
    const updated = fn(state);
    if (updated === state) return;
    if (replay) replay = updated; else { normal = updated; persist(); }
    notify();
}
export const tutorial = {
    subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
    snapshot: () => revision,
    get state() { return replay ?? normal; },
    get error() { return error; },
    get busy() { return busy > 0; },
    get replaying() { return replay !== null; },
    async load(userId: string) {
        if (owner === userId && normal) return;
        await queue;
        owner = userId; normal = null; replay = null; generation++; notify();
        const raw = await callBackend<string | null>('get_onboarding_progress', { userId });
        if (owner !== userId) return;
        normal = raw ? parseProgress(raw) : initialProgress(true);
        error = null; notify();
    },
    retrySave() { persist(); },
    skip(id: Lesson) { update(state => settle(state, id, 'skipped')); },
    skipAll() { update(state => LESSONS.reduce((s, id) => settle(s, id, 'skipped'), state)); },
    skipDiscovery() { update(state => LESSONS.slice(6).reduce((s, id) => settle(s, id, 'skipped'), state)); },
    exchange(id: string, userMessageId?: string) { update(state => {
        const next = exchange(state, id);
        return next !== state && !next.firstUserMessageId && userMessageId ? { ...next, firstUserMessageId: userMessageId } : next;
    }); },
    acknowledge() { update(state => ({ ...state, noticeSeen: true })); },
    startReplay(id?: Lesson) {
        generation++;
        replay = initialProgress();
        if (id) { replay.steps = Object.fromEntries(LESSONS.map(key => [key, key === id ? 'pending' : 'skipped'])) as TutorialProgress['steps']; replay.exchanges = 2; }
        notify();
    },
    endReplay() { replay = null; generation++; notify(); },
};
// Capture ownership and replay identity BEFORE async work begins. Late successes cannot
// complete a different user's lesson or an unrelated replay. Resolves even after unmount.
export function tutorialAction(id: Lesson) {
    const capturedOwner = owner, capturedGeneration = generation;
    return () => {
        if (owner === capturedOwner && generation === capturedGeneration) update(state => settle(state, id, 'completed'));
    };
}
export function tutorialBusy() {
    busy++; notify(); let finished = false;
    return () => { if (!finished) { finished = true; busy--; notify(); } };
}
export async function initializeTutorial(userId: string) {
    const existing = await callBackend<string | null>('get_onboarding_progress', { userId });
    if (!existing) await callBackend('save_onboarding_progress', { userId, stateJson: JSON.stringify(initialProgress()) });
}