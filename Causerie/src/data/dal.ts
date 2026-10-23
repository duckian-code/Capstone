import { initializeDatabase } from './database';
import { UserDAO, UserSettingsDAO } from './dao/user-dao';
import { ThreadDAO } from './dao/thread-dao';
import { MessageDAO } from './dao/message-dao';
import { CorrectionDAO } from './dao/correction-dao';
import { StickyDAO } from './dao/sticky-dao';
import { GoalDAO } from './dao/goal-dao';
import { AppStateDAO } from './dao/app-state-dao';
import { FeedbackDAO } from './dao/feedback-dao';
import { callBackend } from './dao/base';
import type { Message, Thread } from "./models/dao-types";
import { DictionaryDAO } from "./dao/dictionary-dao";

/**
 *  Frontend persistence facade. SQL executes exclusively in Rust
 *  All atomic workflows use a dedicated backend transaction
 */
export class DataAccessLayer {
    readonly users = new UserDAO();
    readonly settings = new UserSettingsDAO();
    readonly threads = new ThreadDAO();
    readonly messages = new MessageDAO();
    readonly corrections = new CorrectionDAO();
    readonly stickies = new StickyDAO();
    readonly goals = new GoalDAO();
    readonly appState = new AppStateDAO();
    readonly feedback = new FeedbackDAO();
    readonly dictionary = new DictionaryDAO();

    initialize(): Promise<void> { return initializeDatabase(); }
    async getThreadHistory(threadId: string): Promise<{ thread: Thread; messages: Message[] } | null> {
        return callBackend("get_thread_history", { threadId });
    }
}
export const dal = new DataAccessLayer();