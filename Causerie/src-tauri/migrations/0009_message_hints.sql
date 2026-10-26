CREATE TABLE message_hints (
    id TEXT PRIMARY KEY NOT NULL,
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    selected_text TEXT NOT NULL,
    start_offset INTEGER NOT NULL CHECK (start_offset >= 0),
    end_offset INTEGER NOT NULL CHECK (end_offset > start_offset),
    user_request TEXT,
    hint TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_message_hints_message
    ON message_hints(message_id, start_offset);