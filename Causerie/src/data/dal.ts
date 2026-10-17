import { initializeDatabase } from './database';
import { UserDAO, UserSettingsDAO } from './dao/user-dao';
import { ThreadDAO } from './dao/thread-dao';
import { MessageDAO } from './dao/message-dao';
import { CorrectionDAO } from './dao/correction-dao';
import { StickyDAO } from './dao/sticky-dao';
import { GoalDAO } from './dao/goal-dao';
import { AppStateDAO } from './dao/app-state-dao';

/** DAL USAGE GUIDE
 * NOTE: DO NOT CHAIN DAL CALLS. MULTITRANSACTION STATEMENTS ARE NOT ATOMIC
 * TODO: implement dedicated Rust Tauri commands with SQLx transactions (FINAL PERSISTENCE TICKET)
 * TODO: persist complete openAI streamed message (FINAL PERSISTENCE TICKET)
/** Composition root: the UI should consume this, not individual SQL statements. */
export class DataAccessLayer {
    readonly users = new UserDAO();
    readonly settings = new UserSettingsDAO();
    readonly threads = new ThreadDAO();
    readonly messages = new MessageDAO();
    readonly corrections = new CorrectionDAO();
    readonly stickies = new StickyDAO();
    readonly goals = new GoalDAO();
    readonly appState = new AppStateDAO();
    initialize(): Promise<void> { return initializeDatabase(); }
    async getThreadHistory(threadId: string) {
        const thread = await this.threads.get(threadId);
        if (!thread) return null;
        const messages = await this.messages.forThread(threadId);
        return { thread, messages };
    }
}
export const dal = new DataAccessLayer();