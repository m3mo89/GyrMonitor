import type { AlertCattleLookup, AlertEventLookup } from '../application/alert.types';
import type { CattleRepository } from '../../cattle-monitoring/application/cattle.types';
import { getSharedDatabaseClient } from '../../database/database-singleton';
import type { DatabaseClient } from '../../database/database.types';

export class RepositoryAlertCattleLookup implements AlertCattleLookup {
  private readonly cattle: CattleRepository;

  constructor(cattle: CattleRepository) {
    this.cattle = cattle;
  }

  async findTagNumber(cattleId: string): Promise<string | undefined> {
    return (await this.cattle.findById(cattleId))?.tagNumber;
  }
}

export class MariaDbAlertEventLookup implements AlertEventLookup {
  private readonly client: DatabaseClient;

  constructor(client: DatabaseClient = getSharedDatabaseClient()) {
    this.client = client;
  }

  async findEventId(sourceEventId: string): Promise<string | null> {
    const rows = await this.client.execute<{ event_id: string }>(
      'SELECT event_id FROM activity_events WHERE id = ? LIMIT 1',
      [sourceEventId]
    );

    return rows[0]?.event_id ?? null;
  }
}
