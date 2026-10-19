import { BaseDAO, newId, nowIso } from './base';
import type { Sticky, StickyColor } from '../models/dao-types.ts';

export class StickyDAO extends BaseDAO {
    get(id: string) { return this.one<Sticky>('SELECT * FROM stickies WHERE id=$1', [id]); }
    forUser(userId: string) { return this.all<Sticky>('SELECT * FROM stickies WHERE user_id=$1 ORDER BY created_at DESC', [userId]); }
    async create(userId: string, selectedText: string, userText: string, title = "", color: StickyColor = "yellow"): Promise<Sticky> {
        const at = nowIso();
        return this.save({ id:newId(), user_id:userId, selected_text:selectedText, title, user_text:userText, color, created_at:at, updated_at:at });
    }
    async save(sticky: Sticky): Promise<Sticky> {
        const saved: Sticky = {...sticky, title: sticky.title.trim(), updated_at: nowIso(),};

        await this.write(`INSERT INTO stickies (id,user_id,selected_text,title,user_text,color,created_at,updated_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            ON CONFLICT(id) DO UPDATE SET
                title=excluded.title, user_text=excluded.user_text, color=excluded.color, updated_at=excluded.updated_at`, [
                saved.id, saved.user_id, saved.selected_text, saved.title, saved.user_text, saved.color, saved.created_at, saved.updated_at,
            ],
        );

        return saved;
    }

    updateText(id: string, userText: string) {
        return this.write('UPDATE stickies SET user_text=$1,updated_at=$2 WHERE id=$3', [userText,nowIso(),id]);
    }
    delete(id: string) { return this.write('DELETE FROM stickies WHERE id=$1', [id]); }
}