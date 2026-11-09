ALTER TABLE threads
    ADD COLUMN conversation_mode TEXT NOT NULL DEFAULT 'text'
        CHECK (conversation_mode IN ('text', 'voice'));

ALTER TABLE threads
    ADD COLUMN live_conversation INTEGER NOT NULL DEFAULT 0
        CHECK (
            live_conversation IN (0, 1)
                AND (live_conversation = 0 OR conversation_mode = 'voice')
            );