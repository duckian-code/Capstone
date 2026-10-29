CREATE TABLE practice_reminders (
    user_id TEXT PRIMARY KEY NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    enabled INTEGER NOT NULL DEFAULT 0
        CHECK (enabled IN (0, 1)),

    every_days INTEGER NOT NULL DEFAULT 1
        CHECK (every_days BETWEEN 1 AND 30),

    at_time TEXT NOT NULL DEFAULT '19:00',
    start_date TEXT NOT NULL,

    last_sent_date TEXT,
    next_variant INTEGER NOT NULL DEFAULT 0
        CHECK (next_variant >= 0),

    last_error TEXT
);
