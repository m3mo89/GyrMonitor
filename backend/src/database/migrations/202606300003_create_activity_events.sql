CREATE TABLE IF NOT EXISTS activity_events (
  id CHAR(36) NOT NULL PRIMARY KEY,
  event_id CHAR(36) NOT NULL,
  device_id VARCHAR(120) NOT NULL,
  cattle_id CHAR(36) NOT NULL,
  event_type ENUM('ACTIVITY', 'INACTIVITY') NOT NULL,
  inactive_minutes INT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  captured_at DATETIME(3) NOT NULL,
  source_type ENUM(
    'DESKTOP_SIMULATOR',
    'MOBILE_CAPTURE',
    'SIMULATOR',
    'MOBILE_CLIENT',
    'DESKTOP_CLIENT',
    'MANUAL_ENTRY',
    'CONTROLLED_TEST_DATA'
  ) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY activity_events_event_id_unique (event_id),
  KEY activity_events_cattle_id_idx (cattle_id),
  KEY activity_events_captured_at_idx (captured_at),
  KEY activity_events_type_captured_idx (event_type, captured_at),
  CONSTRAINT activity_events_cattle_fk FOREIGN KEY (cattle_id) REFERENCES cattle (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
