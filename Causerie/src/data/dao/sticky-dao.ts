import { BaseDAO, newId, nowIso } from './base';
import type { Sticky } from '../models/dao-types.ts';

export class StickyDAO extends BaseDAO {
    get(id: string) { return this.one<Sticky>('SELECT * FROM stickies WHERE id=$1', [id]); }
    forUser(userId: string) { return this.all<Sticky>('SELECT * FROM stickies WHERE user_id=$1 ORDER BY created_at DESC', [userId]); }
    async create(userId: string, selectedText: string, userText: string): Promise<Sticky> {
        const at = nowIso();
        const sticky: Sticky = { id:newId(), user_id:userId, selected_text:selectedText,
            user_text:userText, created_at:at, updated_at:at };
        await this.write('INSERT INTO stickies (id,user_id,selected_text,user_text,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6)',
            [sticky.id,sticky.user_id,sticky.selected_text,sticky.user_text,sticky.created_at,sticky.updated_at]);
        return sticky;
    }
    updateText(id: string, userText: string) {
        return this.write('UPDATE stickies SET user_text=$1,updated_at=$2 WHERE id=$3', [userText,nowIso(),id]);
    }
    delete(id: string) { return this.write('DELETE FROM stickies WHERE id=$1', [id]); }
}