import type { ObservationRepository } from '../application/observation.types';
import type { Observation } from '../domain/observation';

export class LocalObservationRepository implements ObservationRepository {
  private readonly recordsById = new Map<string, Observation>();
  private readonly backendIdByObservationId = new Map<string, string>();

  constructor(records: Observation[] = []) {
    for (const record of records) {
      void this.save(record);
    }
  }

  async save(observation: Observation): Promise<Observation> {
    const existingId = this.backendIdByObservationId.get(observation.observationId);
    if (existingId) {
      return this.clone(this.recordsById.get(existingId) as Observation);
    }

    const stored = this.clone(observation);
    this.recordsById.set(stored.id, stored);
    this.backendIdByObservationId.set(stored.observationId, stored.id);
    return this.clone(stored);
  }

  async findByObservationId(observationId: string): Promise<Observation | null> {
    const id = this.backendIdByObservationId.get(observationId);
    if (!id) {
      return null;
    }

    return this.clone(this.recordsById.get(id) as Observation);
  }

  async listByAlertId(alertId: string): Promise<Observation[]> {
    return [...this.recordsById.values()]
      .filter((record) => record.alertId === alertId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map((record) => this.clone(record));
  }

  private clone(observation: Observation): Observation {
    return { ...observation };
  }
}
