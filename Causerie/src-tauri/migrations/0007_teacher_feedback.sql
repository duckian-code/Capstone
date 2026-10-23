ALTER TABLE message_corrections
ADD COLUMN goal_id TEXT REFERENCES goal_catalog(id);

ALTER TABLE message_corrections
    ADD COLUMN origin TEXT NOT NULL DEFAULT 'manual'
        CHECK (origin IN ('manual', 'teacher'));

CREATE TABLE message_feedback (
    message_id TEXT PRIMARY KEY NOT NULL
        REFERENCES messages(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    source_content TEXT NOT NULL,
    target_language TEXT NOT NULL,
    country TEXT NOT NULL,
    goal_snapshot TEXT NOT NULL,
    instructions TEXT NOT NULL,
    created_at TEXT NOT NULL
        DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);