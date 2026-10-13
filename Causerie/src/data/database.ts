import Database from '@tauri-apps/plugin-sql';

export const DB_URL = 'sqlite:causerie.db' as const;
let pending: Promise<Database> | undefined;

/** One shared initialization promise. A rejection allows a later retry. */
/** Concurrent connection requests receive the same initialization promise **/
export function getDatabase(): Promise<Database> {
    if (!pending) {
        pending = Database.load(DB_URL).catch((error: unknown) => {
            pending = undefined;
            throw error;
        });
    }
    return pending;
}

export async function initializeDatabase(): Promise<void> {
    const db = await getDatabase();
    // verify foreign keys per connection
    const result = await db.select<Array<{ foreign_keys: number }>>('PRAGMA foreign_keys');
    if (result[0]?.foreign_keys !== 1) {
        throw new Error('SQLite foreign-key enforcement is disabled; configure the connection before allowing writes.');
    }
}