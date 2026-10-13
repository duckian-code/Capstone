import type Database from '@tauri-apps/plugin-sql';
import { getDatabase } from '../database';

// base class for which the other DAOs extend
export abstract class BaseDAO {
    protected db(): Promise<Database> { return getDatabase(); }
    protected async one<T>(sql: string, params: unknown[] = []): Promise<T | null> {
        const rows = await (await this.db()).select<T[]>(sql, params);
        return rows[0] ?? null;
    }
    protected async all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
        return (await this.db()).select<T[]>(sql, params);
    }
    protected async write(sql: string, params: unknown[] = []): Promise<number> {
        return (await (await this.db()).execute(sql, params)).rowsAffected;
    }
}
export const newId = (): string => crypto.randomUUID();
export const nowIso = (): string => new Date().toISOString();