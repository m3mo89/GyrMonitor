import { GetSyncStatusUseCase } from '../application/get-sync-status.use-case';
import { SyncIdempotencyService } from '../application/sync-idempotency.service';
import { MariaDbSyncLogRepository } from './mariadb-sync-log.repository';

export const sharedSyncLogRepository = new MariaDbSyncLogRepository();
export const syncIdempotencyService = new SyncIdempotencyService(sharedSyncLogRepository);
export const getSyncStatusUseCase = new GetSyncStatusUseCase(sharedSyncLogRepository);
