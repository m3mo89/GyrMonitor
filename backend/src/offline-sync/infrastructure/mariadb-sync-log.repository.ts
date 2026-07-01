import type { SyncLogRepository } from '../application/offline-sync.types';
import { fromDatabaseDateTime, toDatabaseDateTime } from '../../database/date-mapping';
import { getSharedDatabaseClient } from '../../database/database-singleton';
import type { DatabaseClient } from '../../database/database.types';
import type { SyncEndpoint, SyncLogEntry } from '../domain/sync-log';

type SyncLogRow = {
  id: string;
  idempotency_key: string;
  endpoint: SyncEndpoint;
  client_id: string | null;
  device_id: string | null;
  payload_hash: string;
  processed: number;
  created: number;
  duplicates: number;
  failed: number;
  response_body: string | Record<string, unknown>;
  created_at: string | Date;
};

export class MariaDbSyncLogRepository implements SyncLogRepository {
  private readonly client: DatabaseClient;

  constructor(client: DatabaseClient = getSharedDatabaseClient()) {
    this.client = client;
  }

  async record(entry: SyncLogEntry): Promise<SyncLogEntry> {
    await this.client.execute(
      `INSERT INTO sync_log (
         id, idempotency_key, endpoint, client_id, device_id, payload_hash, processed, created, duplicates, failed, response_body, created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.idempotencyKey,
        entry.endpoint,
        entry.clientId ?? null,
        entry.deviceId ?? null,
        entry.payloadHash,
        entry.processed,
        entry.created,
        entry.duplicates,
        entry.failed,
        JSON.stringify(entry.responseBody),
        toDatabaseDateTime(entry.createdAt)
      ]
    );

    return { ...entry };
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<SyncLogEntry | null> {
    const rows = await this.client.execute<SyncLogRow>(
      `SELECT id, idempotency_key, endpoint, client_id, device_id, payload_hash, processed, created, duplicates, failed, response_body, created_at
       FROM sync_log
       WHERE idempotency_key = ?
       LIMIT 1`,
      [idempotencyKey]
    );

    return rows[0] ? toSyncLogEntry(rows[0]) : null;
  }

  async listByClientId(clientId: string, limit: number): Promise<SyncLogEntry[]> {
    const rows = await this.client.query<SyncLogRow>(
      `SELECT id, idempotency_key, endpoint, client_id, device_id, payload_hash, processed, created, duplicates, failed, response_body, created_at
       FROM sync_log
       WHERE client_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [clientId, limit]
    );

    return rows.map(toSyncLogEntry);
  }

  async listRecent(limit: number): Promise<SyncLogEntry[]> {
    const rows = await this.client.query<SyncLogRow>(
      `SELECT id, idempotency_key, endpoint, client_id, device_id, payload_hash, processed, created, duplicates, failed, response_body, created_at
       FROM sync_log
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map(toSyncLogEntry);
  }
}

function toSyncLogEntry(row: SyncLogRow): SyncLogEntry {
  return {
    id: row.id,
    idempotencyKey: row.idempotency_key,
    endpoint: row.endpoint,
    clientId: row.client_id ?? undefined,
    deviceId: row.device_id ?? undefined,
    payloadHash: row.payload_hash,
    processed: Number(row.processed),
    created: Number(row.created),
    duplicates: Number(row.duplicates),
    failed: Number(row.failed),
    responseBody: typeof row.response_body === 'string' ? JSON.parse(row.response_body) : row.response_body,
    createdAt: fromDatabaseDateTime(row.created_at)
  };
}
