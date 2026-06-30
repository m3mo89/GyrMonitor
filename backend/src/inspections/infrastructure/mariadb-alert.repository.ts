import type { AlertLookup } from '../application/observation.types';
import { getSharedDatabaseClient } from '../../database/database-singleton';
import type { DatabaseClient } from '../../database/database.types';

export class MariaDbAlertRepository implements AlertLookup {
  private readonly client: DatabaseClient;

  constructor(client: DatabaseClient = getSharedDatabaseClient()) {
    this.client = client;
  }

  async exists(alertId: string): Promise<boolean> {
    const rows = await this.client.execute<{ id: string }>('SELECT id FROM alerts WHERE id = ? LIMIT 1', [alertId]);
    return rows.length > 0;
  }
}
