CREATE TABLE IF NOT EXISTS sync_log (
  id CHAR(36) NOT NULL PRIMARY KEY,
  idempotency_key VARCHAR(190) NOT NULL,
  endpoint VARCHAR(32) NOT NULL,
  client_id VARCHAR(120) NULL,
  device_id VARCHAR(120) NULL,
  payload_hash CHAR(64) NOT NULL,
  processed INT NOT NULL,
  created INT NOT NULL,
  duplicates INT NOT NULL,
  failed INT NOT NULL,
  response_body JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY sync_log_idempotency_key_unique (idempotency_key),
  KEY sync_log_client_id_idx (client_id),
  KEY sync_log_created_at_idx (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
