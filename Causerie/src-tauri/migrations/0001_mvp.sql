CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL,
    display_name TEXT,
    pronouns TEXT,
    native_language TEXT,
    target_language TEXT
);
CREATE TABLE user_settings (
    user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notifications INTEGER NOT NULL DEFAULT 1 CHECK (notifications IN (0,1)),
    theme TEXT NOT NULL DEFAULT 'system',
    font_size REAL NOT NULL DEFAULT 16 CHECK (font_size > 0)
);
CREATE TABLE threads (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topic TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    archived_at TEXT
);
CREATE TABLE messages (
    id TEXT PRIMARY KEY NOT NULL,
    thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user','assistant','system','developer','tool')),
    content TEXT NOT NULL,
    sequence_no INTEGER NOT NULL CHECK (sequence_no >= 0),
    openai_response_id TEXT,
    openai_item_id TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(thread_id,sequence_no)
);
CREATE TABLE message_corrections (
    id TEXT PRIMARY KEY NOT NULL,
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    corrected_text TEXT NOT NULL,
    explanation TEXT,
    start_offset INTEGER,
    end_offset INTEGER,
    category TEXT,
    created_at TEXT NOT NULL,
    CHECK (start_offset IS NULL OR start_offset >= 0),
    CHECK (end_offset IS NULL OR (start_offset IS NOT NULL AND end_offset >= start_offset))
);
CREATE TABLE stickies (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    selected_text TEXT NOT NULL,
    user_text TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE TABLE goals (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT
);
CREATE INDEX idx_threads_user ON threads(user_id, updated_at DESC);
CREATE INDEX idx_messages_thread_sequence ON messages(thread_id, sequence_no);
CREATE INDEX idx_corrections_message ON message_corrections(message_id);
CREATE INDEX idx_stickies_user ON stickies(user_id);
CREATE INDEX idx_goals_user ON goals(user_id);