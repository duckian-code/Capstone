CREATE TABLE proficiency_assessments (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status = 'completed'),
    started_at TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    scoring_policy_version TEXT NOT NULL,
    record_json TEXT NOT NULL CHECK (json_valid(record_json))
);
CREATE INDEX idx_assessment_history
    ON proficiency_assessments(user_id, language, completed_at DESC, id DESC);
-- Exposure is independent of completion: cancelled attempts still count as seen.
-- A revised question with the same stable ID is still a previously seen question.
CREATE TABLE proficiency_question_exposure (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    bank_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    PRIMARY KEY (user_id, language, bank_id, question_id)
);
