import { invoke } from "@tauri-apps/api/core";
import { getDatabase } from "../database";
import type { MessageCorrection } from "../models/dao-types";

export type NewCorrection = Omit<MessageCorrection, "id" | "created_at" | "origin" | "goal_id"> & {
    goal_id?: string | null;
};

export class CorrectionDAO {
    async get(id: string): Promise<MessageCorrection | null> {
        await getDatabase();

        return invoke<MessageCorrection | null>("get_correction", {id});
    }

    async forMessage(messageId: string): Promise<MessageCorrection[]> {
        await getDatabase();

        return invoke<MessageCorrection[]>("list_corrections", {messageId});
    }

    async create(input: NewCorrection): Promise<MessageCorrection> {
        await getDatabase();

        return invoke<MessageCorrection>("create_correction", {
            input: {
                ...input,
                goal_id: input.goal_id ?? null,
            },
        });
    }

    async delete(id: string): Promise<number> {
        await getDatabase();

        return invoke<number>("delete_correction", { id });
    }
}
