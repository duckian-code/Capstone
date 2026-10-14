import { BaseDAO, newId } from './base';
import type { Goal } from '../models/dao-types.ts';

export class GoalDAO extends BaseDAO {
    get(id: string) { return this.one<Goal>('SELECT * FROM goals WHERE id=$1', [id]); }
    forUser(userId: string) { return this.all<Goal>('SELECT * FROM goals WHERE user_id=$1 ORDER BY title', [userId]); }
    async create(userId: string, title: string, description: string | null = null): Promise<Goal> {
        const goal: Goal = { id:newId(), user_id:userId, title, description };
        await this.write('INSERT INTO goals (id,user_id,title,description) VALUES ($1,$2,$3,$4)',
            [goal.id,goal.user_id,goal.title,goal.description]);
        return goal;
    }
    async update(goal: Goal) {
        return this.write('UPDATE goals SET title=$1,description=$2 WHERE id=$3', [goal.title,goal.description,goal.id]);
    }
    delete(id: string) { return this.write('DELETE FROM goals WHERE id=$1', [id]); }
}