-- Stable private-beta ownership and safe form update ordering.
ALTER TABLE forms ADD COLUMN owner_id TEXT;
ALTER TABLE forms ADD COLUMN updated_at TEXT;
UPDATE forms
SET owner_id = 'private-beta', updated_at = created_at
WHERE owner_id IS NULL OR updated_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_forms_owner_updated ON forms (owner_id, updated_at DESC);

-- A Durable Object response session may complete at most once. Existing rows remain
-- valid with NULL session IDs; newly written rows include owner/session identity.
ALTER TABLE responses ADD COLUMN owner_id TEXT;
ALTER TABLE responses ADD COLUMN session_id TEXT;
UPDATE responses
SET owner_id = (SELECT forms.owner_id FROM forms WHERE forms.id = responses.form_id)
WHERE owner_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_responses_owner_created ON responses (owner_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_form_session
ON responses (form_id, session_id)
WHERE session_id IS NOT NULL;
