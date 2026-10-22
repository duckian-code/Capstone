import { callBackend } from "./base";
import type { Thread } from "../models/dao-types";

export class ThreadDAO {
    get(id: string): Promise<Thread | null> {
        return callBackend("get_thread", { id });
    }

    forUser(userId: string, includeArchived = false): Promise<Thread[]> {
        return callBackend("list_threads", { userId, includeArchived });
    }

    create(
        userId: string,
        title: string,
        topic: string | null = null,
    ): Promise<Thread> {
        return callBackend("create_thread", { userId, title, topic });
    }

    rename(id: string, title: string): Promise<number> {
        return callBackend("rename_thread", { id, title });
    }

    archive(id: string): Promise<number> {
        return callBackend("set_thread_archived", { id, archived: true });
    }

    restore(id: string): Promise<number> {
        return callBackend("set_thread_archived", { id, archived: false });
    }

    delete(id: string): Promise<number> {
        return callBackend("delete_thread", { id });
    }
}