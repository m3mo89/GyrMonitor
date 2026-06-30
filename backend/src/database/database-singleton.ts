import type { DatabaseClient } from './database.types';
import { createConfiguredMariaDbClient } from './mysql2-driver';

let sharedClient: DatabaseClient | null = null;

export function getSharedDatabaseClient(): DatabaseClient {
  if (!sharedClient) {
    sharedClient = createConfiguredMariaDbClient();
  }

  return sharedClient;
}

export async function closeSharedDatabaseClient(): Promise<void> {
  if (!sharedClient) {
    return;
  }

  await sharedClient.close();
  sharedClient = null;
}
