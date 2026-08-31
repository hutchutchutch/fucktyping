-- Forms authored by creators (config is the FormConfig JSON the DO interprets).
CREATE TABLE IF NOT EXISTS forms (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    config      TEXT NOT NULL,          -- JSON (FormConfigSchema)
    created_at  TEXT NOT NULL
);

-- Collected structured output, one row per completed voice session.
CREATE TABLE IF NOT EXISTS responses (
    id          TEXT PRIMARY KEY,
    form_id     TEXT NOT NULL,
    answers     TEXT NOT NULL,          -- JSON (questionId -> extracted value)
    created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_responses_form ON responses (form_id);
