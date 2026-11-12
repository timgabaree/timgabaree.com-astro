-- Applies only to family-site-traffic, not the archive catalog.
CREATE TABLE IF NOT EXISTS traffic_email_delivery (
 report_day TEXT PRIMARY KEY,
 status TEXT NOT NULL CHECK(status IN ('pending','sent')),
 payload TEXT NOT NULL,
 sent_at TEXT,
 provider_id TEXT
);
