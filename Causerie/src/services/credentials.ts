import {
    Stronghold,
    type Client
} from "@tauri-apps/plugin-stronghold";

import { appLocalDataDir, join } from "@tauri-apps/api/path";

// TODO: implement OS-protected secret for automatic unlocking - cross platform support/integration
// TODO: credential resolver for Rust backend

/** DEMO FOR USING STRONGHOLD VAULT
 *
 * import { credentials } from "./services/credentials";
 *
 * // Unlock or create the Stronghold snapshot.
 * await credentials.initialize(password);
 *
 * // Store a user-provided OpenAI API key.
 * await credentials.saveApiKey(apiKeyFromInput);
 *
 * // Check whether a credential is stored.
 * const isConfigured = await credentials.hasApiKey();
 *
 * // Retrieve it when needed.
 * const key = await credentials.getApiKey();
 *
 * // Delete the stored key.
 * await credentials.deleteApiKey();
 */

const CLIENT_NAME = "application";
const API_KEY_RECORD = "openai_api_key";

type StrongholdSession = {
    stronghold: Stronghold;
    client: Client;
};

export class CredentialsService {
    private session: StrongholdSession | null = null;

    async init(password: string): Promise<void> {
        if (this.session) return;

        if (!password) {
            throw new Error("A Stronghold password is required");
        }

        const path = await join(
            await appLocalDataDir(),
            "credentials.hold"
        );

        const stronghold = await Stronghold.load(path, password);

        let client: Client;

        try {
            client = await stronghold.loadClient(CLIENT_NAME)
        } catch {
            // First time initialization
            client = await stronghold.createClient(CLIENT_NAME);
        }

        this.session = { stronghold, client };
    }

    private getSession(): StrongholdSession {
        if (!this.session) {
            throw new Error("Credential storage not initialized");
        }

        return this.session;
    }

    async saveApiKey(apiKey: string): Promise<void> {
        if (!apiKey.trim()) {
            throw new Error("API key cannot be empty");
        }

        const { stronghold, client } = this.getSession();

        const bytes = Array.from(
            new TextEncoder().encode(apiKey.trim())
        );

        await client.getStore().insert(API_KEY_RECORD, bytes);

        await stronghold.save();
    }

    async getApiKey(): Promise<string | null> {
        const { client } = this.getSession();

        const data = await client.getStore().get(API_KEY_RECORD);

        if (data === null) return null;

        return new TextDecoder().decode(data);
    }

    async hasApiKey(): Promise<boolean> {
        return (await this.getApiKey()) !== null;
    }

    async deleteApiKey(): Promise<void> {
        const { stronghold, client } = this.getSession();

        await client.getStore().remove(API_KEY_RECORD);
        await stronghold.save();
    }
}

export const credentials = new CredentialsService();