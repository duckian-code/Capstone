CREATE TABLE personal_dictionary_new (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language TEXT NOT NULL CHECK (language IN ('es', 'fr', 'en')),
    word_key TEXT NOT NULL,
    word TEXT NOT NULL,
    PRIMARY KEY (user_id, language, word_key)
) WITHOUT ROWID;

INSERT INTO personal_dictionary_new (
    user_id, language, word_key, word
)
SELECT user_id, language, word_key, word
FROM personal_dictionary;

DROP TABLE personal_dictionary;

ALTER TABLE personal_dictionary_new
    RENAME TO personal_dictionary;