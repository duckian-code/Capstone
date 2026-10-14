import { BaseDAO, newId, nowIso } from './base';
import type { MessageCorrection } from '../models/dao-types.ts';

export class CorrectionDAO extends BaseDAO {
    get(id: string) { return this.one<MessageCorrection>('SELECT * FROM message_corrections WHERE id=$1', [id]); }
    forMessage(messageId: string) {
        return this.all<MessageCorrection>('SELECT * FROM message_corrections WHERE message_id=$1 ORDER BY created_at,id', [messageId]);
    }
    async create(input: Omit<MessageCorrection, 'id' | 'created_at'>): Promise<MessageCorrection> {
        const result: MessageCorrection = { ...input, id: newId(), created_at: nowIso() };
        await this.write(`INSERT INTO message_corrections
      (id,message_id,original_text,corrected_text,explanation,start_offset,end_offset,category,created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [result.id,result.message_id,result.original_text,result.corrected_text,result.explanation,
                result.start_offset,result.end_offset,result.category,result.created_at]);
        return result;
    }
    delete(id: string) { return this.write('DELETE FROM message_corrections WHERE id=$1', [id]); }
}