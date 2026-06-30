import type { ObservationRepository } from '../application/observation.types';
import { createObservation } from '../domain/observation';
import type { Observation } from '../domain/observation';
import { fromDatabaseDateTime, toDatabaseDateTime } from '../../database/date-mapping';
import { getSharedDatabaseClient } from '../../database/database-singleton';
import type { DatabaseClient } from '../../database/database.types';
import { isDuplicateKeyError } from '../../database/mysql2-driver';

type ObservationRow = {
  id: string;
  observation_id: string;
  alert_id: string;
  user_id: string;
  client_id: string | null;
  comment: string;
  created_at: string | Date;
};

export class MariaDbObservationRepository implements ObservationRepository {
  private readonly client: DatabaseClient;

  constructor(client: DatabaseClient = getSharedDatabaseClient()) {
    this.client = client;
  }

  async save(observation: Observation): Promise<Observation> {
    try {
      await this.client.execute(
        `INSERT INTO observations (id, observation_id, alert_id, user_id, client_id, comment, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          observation.id,
          observation.observationId,
          observation.alertId,
          observation.userId,
          observation.clientId ?? null,
          observation.comment,
          toDatabaseDateTime(observation.createdAt)
        ]
      );

      return { ...observation };
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }

      const existing = await this.findByObservationId(observation.observationId);
      if (existing) {
        return existing;
      }

      throw error;
    }
  }

  async findByObservationId(observationId: string): Promise<Observation | null> {
    const rows = await this.client.execute<ObservationRow>(
      `SELECT id, observation_id, alert_id, user_id, client_id, comment, created_at
       FROM observations
       WHERE observation_id = ?
       LIMIT 1`,
      [observationId]
    );

    return rows[0] ? toObservation(rows[0]) : null;
  }

  async listByAlertId(alertId: string): Promise<Observation[]> {
    const rows = await this.client.execute<ObservationRow>(
      `SELECT id, observation_id, alert_id, user_id, client_id, comment, created_at
       FROM observations
       WHERE alert_id = ?
       ORDER BY created_at ASC`,
      [alertId]
    );

    return rows.map(toObservation);
  }
}

function toObservation(row: ObservationRow): Observation {
  return createObservation({
    id: row.id,
    observationId: row.observation_id,
    alertId: row.alert_id,
    userId: row.user_id,
    clientId: row.client_id ?? undefined,
    comment: row.comment,
    createdAt: fromDatabaseDateTime(row.created_at)
  });
}
