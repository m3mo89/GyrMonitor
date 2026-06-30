CREATE TABLE IF NOT EXISTS observations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  observation_id CHAR(36) NOT NULL,
  alert_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  client_id VARCHAR(120) NULL,
  comment TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY observations_observation_id_unique (observation_id),
  KEY observations_alert_id_idx (alert_id),
  KEY observations_user_id_idx (user_id),
  CONSTRAINT observations_alert_fk FOREIGN KEY (alert_id) REFERENCES alerts (id),
  CONSTRAINT observations_user_fk FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
