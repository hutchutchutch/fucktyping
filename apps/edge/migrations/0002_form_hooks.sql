-- Per-form callback (where to POST collected answers) + opaque metadata
-- (e.g. the Discord target to deliver the answer to).
ALTER TABLE forms ADD COLUMN callback_url TEXT;
ALTER TABLE forms ADD COLUMN meta TEXT;
