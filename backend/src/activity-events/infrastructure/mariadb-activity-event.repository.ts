import type { ActivityEventRepository, NormalizedActivityEventsQuery, PaginatedResult } from '../application/activity-event.types';
import { createActivityEvent } from '../domain/activity-event';
import type { ActivityEvent, EventType, SourceType } from '../domain/activity-event';
import { fromDatabaseDateTime, toDatabaseDateTime } from '../../database/date-mapping';
import { getSharedDatabaseClient } from '../../database/database-singleton';
import type { DatabaseClient } from '../../database/database.types';
import { isDuplicateKeyError } from '../../database/mysql2-driver';

type ActivityEventRow = {
  id: string;
  event_id: string;
  device_id: string;
  cattle_id: string;
  event_type: EventType;
  inactive_minutes: number | null;
  confidence: number | string;
  captured_at: string | Date;
  source_type: SourceType;
  created_at: string | Date;
};

type CountRow = {
  total: number;
};

export class MariaDbActivityEventRepository implements ActivityEventRepository {
  private readonly client: DatabaseClient;

  constructor(client: DatabaseClient = getSharedDatabaseClient()) {
    this.client = client;
  }

  async save(event: ActivityEvent): Promise<ActivityEvent> {
    try {
      await this.client.execute(
        `INSERT INTO activity_events (
           id, event_id, device_id, cattle_id, event_type, inactive_minutes, confidence, captured_at, source_type, created_at
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.id,
          event.eventId,
          event.deviceId,
          event.cattleId,
          event.eventType,
          event.inactiveMinutes ?? null,
          event.confidence,
          toDatabaseDateTime(event.capturedAt),
          event.source,
          toDatabaseDateTime(event.createdAt)
        ]
      );

      return { ...event };
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }

      const existing = await this.findByEventId(event.eventId);
      if (existing) {
        return existing;
      }

      throw error;
    }
  }

  async findByEventId(eventId: string): Promise<ActivityEvent | null> {
    const rows = await this.client.execute<ActivityEventRow>(
      `SELECT id, event_id, device_id, cattle_id, event_type, inactive_minutes, confidence, captured_at, source_type, created_at
       FROM activity_events
       WHERE event_id = ?
       LIMIT 1`,
      [eventId]
    );

    return rows[0] ? toActivityEvent(rows[0]) : null;
  }

  async list(query: NormalizedActivityEventsQuery): Promise<PaginatedResult<ActivityEvent>> {
    const filters: string[] = [];
    const params: unknown[] = [];

    if (query.cattleId) {
      filters.push('cattle_id = ?');
      params.push(query.cattleId);
    }

    if (query.eventType) {
      filters.push('event_type = ?');
      params.push(query.eventType);
    }

    if (query.from) {
      filters.push('captured_at >= ?');
      params.push(toDatabaseDateTime(query.from));
    }

    if (query.to) {
      filters.push('captured_at <= ?');
      params.push(toDatabaseDateTime(query.to));
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const [count] = await this.client.query<CountRow>(`SELECT COUNT(*) AS total FROM activity_events ${where}`, params);
    const offset = (query.page - 1) * query.pageSize;
    const rows = await this.client.query<ActivityEventRow>(
      `SELECT id, event_id, device_id, cattle_id, event_type, inactive_minutes, confidence, captured_at, source_type, created_at
       FROM activity_events
       ${where}
       ORDER BY captured_at DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, query.pageSize, offset]
    );

    return {
      data: rows.map(toActivityEvent),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: Number(count?.total ?? 0)
      }
    };
  }
}

function toActivityEvent(row: ActivityEventRow): ActivityEvent {
  return createActivityEvent({
    id: row.id,
    eventId: row.event_id,
    deviceId: row.device_id,
    cattleId: row.cattle_id,
    eventType: row.event_type,
    inactiveMinutes: row.inactive_minutes ?? undefined,
    confidence: Number(row.confidence),
    capturedAt: fromDatabaseDateTime(row.captured_at),
    source: row.source_type,
    createdAt: fromDatabaseDateTime(row.created_at)
  });
}
