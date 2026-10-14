import { BaseDAO, newId } from './base';
import type { User, UserSettings } from '../models/dao-types.ts';

export class UserDAO extends BaseDAO {
    get(id: string) { return this.one<User>('SELECT * FROM users WHERE id = $1', [id]); }
    list() { return this.all<User>('SELECT * FROM users ORDER BY display_name'); }
    async create(fields: Omit<User, 'id'>): Promise<User> {
        const user: User = { id: newId(), ...fields };
        await this.write('INSERT INTO users (id, display_name, pronouns, native_language, target_language) VALUES ($1,$2,$3,$4,$5)',
            [user.id, user.display_name, user.pronouns, user.native_language, user.target_language]);
        return user;
    }
    async update(user: User) {
        return this.write('UPDATE users SET display_name=$1, pronouns=$2, native_language=$3, target_language=$4 WHERE id=$5',
            [user.display_name, user.pronouns, user.native_language, user.target_language, user.id]);
    }
    delete(id: string) { return this.write('DELETE FROM users WHERE id=$1', [id]); }
}
export class UserSettingsDAO extends BaseDAO {
    get(userId: string) { return this.one<UserSettings>('SELECT * FROM user_settings WHERE user_id=$1', [userId]); }
    // Upsert is one atomic statement; no read-then-insert race.
    async save(value: UserSettings) {
        await this.write(`INSERT INTO user_settings (user_id, notifications, theme, font_size) VALUES ($1,$2,$3,$4)
      ON CONFLICT(user_id) DO UPDATE SET notifications=excluded.notifications, theme=excluded.theme, font_size=excluded.font_size`,
            [value.user_id, value.notifications, value.theme, value.font_size]);
    }
}