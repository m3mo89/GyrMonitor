import { GetSyncStatusUseCase } from '../application/get-sync-status.use-case';
import { SyncEventsUseCase } from '../application/sync-events.use-case';
import { SyncIdempotencyService } from '../application/sync-idempotency.service';
import { SyncObservationsUseCase } from '../application/sync-observations.use-case';
import { MariaDbSyncLogRepository } from './mariadb-sync-log.repository';
import { addAlertObservationUseCase, sharedObservationRepository } from '../../inspections/infrastructure/observation-singletons';
import { registerActivityEventUseCase, sharedActivityEventRepository } from '../../activity-events/infrastructure/activity-event-singletons';

export const sharedSyncLogRepository = new MariaDbSyncLogRepository();
export const syncIdempotencyService = new SyncIdempotencyService(sharedSyncLogRepository);

export const syncEventsUseCase = new SyncEventsUseCase(
  registerActivityEventUseCase,
  sharedActivityEventRepository,
  syncIdempotencyService
);

export const syncObservationsUseCase = new SyncObservationsUseCase(
  addAlertObservationUseCase,
  sharedObservationRepository,
  syncIdempotencyService
);

export const getSyncStatusUseCase = new GetSyncStatusUseCase(sharedSyncLogRepository);
