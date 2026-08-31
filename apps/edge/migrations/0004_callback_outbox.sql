-- Durable outbox for completion callbacks. Queue messages carry only this row ID;
-- payload and delivery state remain inspectable in D1 across retries/deployments.
CREATE TABLE callback_deliveries (
    id            TEXT PRIMARY KEY,
    response_id   TEXT NOT NULL,
    form_id       TEXT NOT NULL,
    callback_url  TEXT NOT NULL,
    payload       TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'queued', 'processing', 'retrying', 'delivered', 'failed')),
    attempts      INTEGER NOT NULL DEFAULT 0,
    last_error    TEXT,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
);

CREATE INDEX idx_callback_deliveries_status_updated
ON callback_deliveries (status, updated_at);
