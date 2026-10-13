import { BaseDAO, newId, nowIso } from './base';
import type { Message, MessageRole } from '../models/entities';

export class MessageDAO extends BaseDAO {
    get(id: string) { return this.one<Message>('SELECT * FROM messages WHERE id=$1', [id]); }
    forThread(threadId: string) {
        return this.all<Message>('SELECT * FROM messages WHERE thread_id=$1 ORDER BY sequence_no ASC', [threadId]);
    }
    // One INSERT calculates the next position atomically in SQLite; unique index protects uniqueness.
    async append(threadId: string, role: MessageRole, content: string,
                 responseId: string | null = null, itemId: string | null = null): Promise<Message> {
        const id = newId(), timestamp = nowIso();
        await this.write(`INSERT INTO messages
      (id,thread_id,role,content,sequence_no,openai_response_id,openai_item_id,created_at)
      SELECT $1,$2,$3,$4,COALESCE(MAX(sequence_no)+1,0),$5,$6,$7
      FROM messages WHERE thread_id=$2`,
            [id,threadId,role,content,responseId,itemId,timestamp]);
        const created = await this.get(id);
        if (!created) throw new Error('New message not found after insertion');
        return created;
    }
    delete(id: string) { return this.write('DELETE FROM messages WHERE id=$1', [id]); }
}