CREATE TABLE IF NOT EXISTS alerts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  cattle_id CHAR(36) NOT NULL,
  source_event_id CHAR(36) NULL,
  severity ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
  status ENUM('PENDING', 'ATTENDED') NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY alerts_cattle_id_idx (cattle_id),
  KEY alerts_source_event_id_idx (source_event_id),
  KEY alerts_status_idx (status),
  KEY alerts_severity_idx (severity),
  CONSTRAINT alerts_cattle_fk FOREIGN KEY (cattle_id) REFERENCES cattle (id),
  CONSTRAINT alerts_source_event_fk FOREIGN KEY (source_event_id) REFERENCES activity_events (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
