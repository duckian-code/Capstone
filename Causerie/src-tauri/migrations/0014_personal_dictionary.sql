CREATE TABLE personal_dictionary (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language TEXT NOT NULL CHECK (language IN ('es', 'fr')),
    word_key TEXT NOT NULL,
    word TEXT NOT NULL,
    PRIMARY KEY (user_id, language, word_key)
) WITHOUT ROWID;