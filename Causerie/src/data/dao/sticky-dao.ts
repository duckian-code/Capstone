import { callBackend } from "./base";
import type { Sticky, StickyColor } from "../models/dao-types";
import {StickyCategory} from "../models/sticky-categories.ts";

export class StickyDAO {
    get(id: string): Promise<Sticky | null> {
        return callBackend("get_sticky", { id });
    }

    forUser(userId: string): Promise<Sticky[]> {
        return callBackend("list_stickies", { userId });
    }

    create(
        userId: string,
        selectedText: string,
        userText: string,
        title = "",
        color: StickyColor = "yellow",
        categories: StickyCategory[] = [],
    ): Promise<Sticky> {
        return callBackend("create_sticky", {
            userId,
            selectedText,
            userText,
            title,
            color,
            categories,
        });
    }

    save(sticky: Sticky): Promise<Sticky> {
        return callBackend("save_sticky", { sticky });
    }

    updateText(id: string, userText: string): Promise<number> {
        return callBackend("update_sticky_text", { id, userText });
    }

    delete(id: string): Promise<number> {
        return callBackend("delete_sticky", { id });
    }
}