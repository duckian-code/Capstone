import { getDatabase } from '../database';
import {invoke} from "@tauri-apps/api/core";

// base class for which the other DAOs extend
export async function callBackend<T>(command: string, args?: Record<string, unknown>): Promise<T> {
    await getDatabase();
    return invoke<T>(command, args);
}