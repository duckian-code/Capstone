CREATE TRIGGER messages_update_thread_timestamp
    AFTER INSERT ON messages
BEGIN
    UPDATE threads
    SET updated_at = MAX(updated_at, NEW.created_at)
    WHERE id = NEW.thread_id;
END;