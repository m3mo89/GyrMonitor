import type { ActivityEventRepository, NormalizedActivityEventsQuery, PaginatedResult } from '../application/activity-event.types';
import type { ActivityEvent } from '../domain/activity-event';

export class LocalActivityEventRepository implements ActivityEventRepository {
  private readonly recordsById = new Map<string, ActivityEvent>();
  private readonly backendIdByEventId = new Map<string, string>();

  constructor(records: ActivityEvent[] = []) {
    for (const record of records) {
      void this.save(record);
    }
  }

  async save(event: ActivityEvent): Promise<ActivityEvent> {
    const existingId = this.backendIdByEventId.get(event.eventId);
    if (existingId) {
      return this.clone(this.recordsById.get(existingId) as ActivityEvent);
    }

    const stored = this.clone(event);
    this.recordsById.set(stored.id, stored);
    this.backendIdByEventId.set(stored.eventId, stored.id);
    return this.clone(stored);
  }

  async findByEventId(eventId: string): Promise<ActivityEvent | null> {
    const id = this.backendIdByEventId.get(eventId);
    if (!id) {
      return null;
    }

    return this.clone(this.recordsById.get(id) as ActivityEvent);
  }

  async list(query: NormalizedActivityEventsQuery): Promise<PaginatedResult<ActivityEvent>> {
    const records = [...this.recordsById.values()]
      .filter((record) => !query.cattleId || record.cattleId === query.cattleId)
      .filter((record) => !query.eventType || record.eventType === query.eventType)
      .filter((record) => !query.from || record.capturedAt >= query.from)
      .filter((record) => !query.to || record.capturedAt <= query.to)
      .sort((left, right) => right.capturedAt.localeCompare(left.capturedAt) || right.createdAt.localeCompare(left.createdAt));

    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;

    return {
      data: records.slice(start, end).map((record) => this.clone(record)),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: records.length
      }
    };
  }

  private clone(event: ActivityEvent): ActivityEvent {
    return { ...event };
  }
}
