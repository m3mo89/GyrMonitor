import { Module } from '@nestjs/common';

import { GetSyncStatusUseCase } from './application/get-sync-status.use-case';
import { SyncEventsUseCase } from './application/sync-events.use-case';
import { SyncObservationsUseCase } from './application/sync-observations.use-case';
import { OfflineSyncController } from './http/offline-sync.controller';
import { getSyncStatusUseCase, syncEventsUseCase, syncObservationsUseCase } from './infrastructure/offline-sync-singletons';

@Module({
  controllers: [OfflineSyncController],
  providers: [
    { provide: SyncEventsUseCase, useValue: syncEventsUseCase },
    { provide: SyncObservationsUseCase, useValue: syncObservationsUseCase },
    { provide: GetSyncStatusUseCase, useValue: getSyncStatusUseCase }
  ]
})
export class OfflineSyncModule {}
