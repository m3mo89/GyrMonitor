import type { AlertRepository, NormalizedListAlertsQuery, PaginatedResult } from '../application/alert.types';
import { createAlert } from '../domain/alert';
import type { Alert, AlertStatus } from '../domain/alert';

export class LocalAlertRepository implements AlertRepository {
  private readonly recordsById = new Map<string, Alert>();
  private readonly idBySourceEventId = new Map<string, string>();

  constructor(records: Alert[] = []) {
    for (const record of records) {
      void this.save(record);
    }
  }

  async save(alert: Alert): Promise<Alert> {
    if (alert.sourceEventId) {
      const existingId = this.idBySourceEventId.get(alert.sourceEventId);
      if (existingId) {
        return this.clone(this.recordsById.get(existingId) as Alert);
      }
    }

    const stored = this.clone(createAlert(alert));
    this.recordsById.set(stored.id, stored);

    if (stored.sourceEventId) {
      this.idBySourceEventId.set(stored.sourceEventId, stored.id);
    }

    return this.clone(stored);
  }

  async findById(alertId: string): Promise<Alert | null> {
    const record = this.recordsById.get(alertId);
    return record ? this.clone(record) : null;
  }

  async findBySourceEventId(sourceEventId: string): Promise<Alert | null> {
    const id = this.idBySourceEventId.get(sourceEventId);
    if (!id) {
      return null;
    }

    return this.clone(this.recordsById.get(id) as Alert);
  }

  async list(query: NormalizedListAlertsQuery): Promise<PaginatedResult<Alert>> {
    const records = [...this.recordsById.values()]
      .filter((record) => !query.status || record.status === query.status)
      .filter((record) => !query.severity || record.severity === query.severity)
      .filter((record) => !query.cattleId || record.cattleId === query.cattleId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

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

  async updateStatus(alertId: string, status: AlertStatus, attendedAt?: string): Promise<Alert | null> {
    const existing = this.recordsById.get(alertId);
    if (!existing) {
      return null;
    }

    const updated = this.clone(
      createAlert({
        ...existing,
        status,
        attendedAt
      })
    );
    this.recordsById.set(alertId, updated);
    return this.clone(updated);
  }

  private clone(alert: Alert): Alert {
    return { ...alert };
  }
}
