CREATE TABLE conversation_summaries (
    thread_id TEXT PRIMARY KEY NOT NULL
        REFERENCES threads(id) ON DELETE CASCADE,
    through_sequence INTEGER NOT NULL CHECK (through_sequence >= 0),
    source_hash TEXT NOT NULL,
    summary TEXT NOT NULL CHECK (length(trim(summary)) > 0),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- An edited or deleted message can invalidate the summary.
CREATE TRIGGER invalidate_summary_after_message_update
    AFTER UPDATE OF content, role, sequence_no, thread_id ON messages
BEGIN
    DELETE FROM conversation_summaries
    WHERE thread_id IN (OLD.thread_id, NEW.thread_id);
END;

CREATE TRIGGER invalidate_summary_after_message_delete
    AFTER DELETE ON messages
BEGIN
    DELETE FROM conversation_summaries
    WHERE thread_id = OLD.thread_id;
END;
