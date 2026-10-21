CREATE TABLE IF NOT EXISTS lesson_requests (
  id TEXT PRIMARY KEY,
  payload_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  payload TEXT NOT NULL,
  notification_state TEXT NOT NULL DEFAULT 'pending',
  notification_attempted_at INTEGER,
  notification_id TEXT
);
CREATE INDEX IF NOT EXISTS lesson_requests_created ON lesson_requests(created_at);
CREATE INDEX IF NOT EXISTS lesson_requests_expiry ON lesson_requests(expires_at);
CREATE INDEX IF NOT EXISTS lesson_requests_notification ON lesson_requests(notification_attempted_at);
