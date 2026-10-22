import { invoke } from '@tauri-apps/api/core';

let pending: Promise<void> | undefined;

/** One shared initialization promise. A rejection allows a later retry. */
/** Concurrent connection requests receive the same initialization promise **/
export function getDatabase(): Promise<void> {
    if (!pending) {
        pending = (async () => {
           await invoke<void>("initialize_database");
           await invoke<void>('initialize_goal_catalog');
        })().catch((error: unknown) => {
            pending = undefined;
            throw error;
        });
    }
    return pending;
}

export async function initializeDatabase(): Promise<void> {
    return getDatabase();
}