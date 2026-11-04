CREATE TABLE user_proficiency (
    user_id TEXT PRIMARY KEY NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    level TEXT NOT NULL DEFAULT 'A2'
        CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'))
);