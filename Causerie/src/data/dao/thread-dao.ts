import { BaseDAO, newId, nowIso } from './base';
import type { Thread } from '../models/entities';

export class ThreadDAO extends BaseDAO {
    get(id: string) { return this.one<Thread>('SELECT * FROM threads WHERE id=$1', [id]); }
    forUser(userId: string, includeArchived = false) {
        return this.all<Thread>(`SELECT * FROM threads WHERE user_id=$1 AND ($2=1 OR archived_at IS NULL)
      ORDER BY updated_at DESC`, [userId, includeArchived ? 1 : 0]);
    }
    async create(userId: string, title: string, topic: string | null = null): Promise<Thread> {
        const timestamp = nowIso();
        const thread: Thread = { id: newId(), user_id: userId, title, topic,
            created_at: timestamp, updated_at: timestamp, archived_at: null };
        await this.write('INSERT INTO threads (id,user_id,title,topic,created_at,updated_at,archived_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
            [thread.id,thread.user_id,thread.title,thread.topic,thread.created_at,thread.updated_at,thread.archived_at]);
        return thread;
    }
    rename(id: string, title: string) {
        return this.write('UPDATE threads SET title=$1,updated_at=$2 WHERE id=$3', [title,nowIso(),id]);
    }
    archive(id: string) {
        return this.write('UPDATE threads SET archived_at=$1,updated_at=$1 WHERE id=$2', [nowIso(),id]);
    }
    restore(id: string) {
        return this.write('UPDATE threads SET archived_at=NULL,updated_at=$1 WHERE id=$2', [nowIso(),id]);
    }
    delete(id: string) { return this.write('DELETE FROM threads WHERE id=$1', [id]); }
}