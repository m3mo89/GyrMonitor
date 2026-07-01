ALTER TABLE alerts
  MODIFY status ENUM('PENDING', 'IN_PROGRESS', 'ATTENDED') NOT NULL,
  ADD COLUMN risk_score DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER severity,
  ADD COLUMN reason VARCHAR(255) NOT NULL DEFAULT 'Inactividad prolongada' AFTER status,
  ADD COLUMN attended_at DATETIME(3) NULL AFTER created_at,
  ADD UNIQUE KEY alerts_source_event_unique (source_event_id),
  ADD KEY alerts_created_at_idx (created_at);
