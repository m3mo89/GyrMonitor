import type { AlertRepository, NormalizedListAlertsQuery, PaginatedResult } from '../application/alert.types';
import { createAlert } from '../domain/alert';
import type { Alert, AlertStatus } from '../domain/alert';
import type { AlertSeverity } from '../../inactivity-analysis/domain/severity';
import { fromDatabaseDateTime, toDatabaseDateTime } from '../../database/date-mapping';
import { getSharedDatabaseClient } from '../../database/database-singleton';
import type { DatabaseClient } from '../../database/database.types';
import { isDuplicateKeyError } from '../../database/mysql2-driver';

type AlertRow = {
  id: string;
  cattle_id: string;
  source_event_id: string | null;
  severity: AlertSeverity;
  risk_score: number | string;
  status: AlertStatus;
  reason: string;
  created_at: string | Date;
  attended_at: string | Date | null;
};

type CountRow = {
  total: number;
};

export class MariaDbAlertRepository implements AlertRepository {
  private readonly client: DatabaseClient;

  constructor(client: DatabaseClient = getSharedDatabaseClient()) {
    this.client = client;
  }

  async save(alert: Alert): Promise<Alert> {
    try {
      await this.client.execute(
        `INSERT INTO alerts (
           id, cattle_id, source_event_id, severity, risk_score, status, reason, created_at, attended_at
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          alert.id,
          alert.cattleId,
          alert.sourceEventId,
          alert.severity,
          alert.riskScore,
          alert.status,
          alert.reason,
          toDatabaseDateTime(alert.createdAt),
          alert.attendedAt ? toDatabaseDateTime(alert.attendedAt) : null
        ]
      );

      return { ...alert };
    } catch (error) {
      if (!isDuplicateKeyError(error) || !alert.sourceEventId) {
        throw error;
      }

      const existing = await this.findBySourceEventId(alert.sourceEventId);
      if (existing) {
        return existing;
      }

      throw error;
    }
  }

  async findById(alertId: string): Promise<Alert | null> {
    const rows = await this.client.execute<AlertRow>(
      `SELECT id, cattle_id, source_event_id, severity, risk_score, status, reason, created_at, attended_at
       FROM alerts
       WHERE id = ?
       LIMIT 1`,
      [alertId]
    );

    return rows[0] ? toAlert(rows[0]) : null;
  }

  async findBySourceEventId(sourceEventId: string): Promise<Alert | null> {
    const rows = await this.client.execute<AlertRow>(
      `SELECT id, cattle_id, source_event_id, severity, risk_score, status, reason, created_at, attended_at
       FROM alerts
       WHERE source_event_id = ?
       LIMIT 1`,
      [sourceEventId]
    );

    return rows[0] ? toAlert(rows[0]) : null;
  }

  async list(query: NormalizedListAlertsQuery): Promise<PaginatedResult<Alert>> {
    const filters: string[] = [];
    const params: unknown[] = [];

    if (query.status) {
      filters.push('status = ?');
      params.push(query.status);
    }

    if (query.severity) {
      filters.push('severity = ?');
      params.push(query.severity);
    }

    if (query.cattleId) {
      filters.push('cattle_id = ?');
      params.push(query.cattleId);
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const [count] = await this.client.query<CountRow>(`SELECT COUNT(*) AS total FROM alerts ${where}`, params);
    const offset = (query.page - 1) * query.pageSize;
    const rows = await this.client.query<AlertRow>(
      `SELECT id, cattle_id, source_event_id, severity, risk_score, status, reason, created_at, attended_at
       FROM alerts
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, query.pageSize, offset]
    );

    return {
      data: rows.map(toAlert),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: Number(count?.total ?? 0)
      }
    };
  }

  async updateStatus(alertId: string, status: AlertStatus, attendedAt?: string): Promise<Alert | null> {
    await this.client.execute(
      `UPDATE alerts
       SET status = ?, attended_at = ?
       WHERE id = ?`,
      [status, attendedAt ? toDatabaseDateTime(attendedAt) : null, alertId]
    );

    return this.findById(alertId);
  }
}

function toAlert(row: AlertRow): Alert {
  return createAlert({
    id: row.id,
    cattleId: row.cattle_id,
    sourceEventId: row.source_event_id,
    severity: row.severity,
    riskScore: Number(row.risk_score),
    status: row.status,
    reason: row.reason,
    createdAt: fromDatabaseDateTime(row.created_at),
    attendedAt: row.attended_at ? fromDatabaseDateTime(row.attended_at) : undefined
  });
}
