import { Module } from '@nestjs/common';

import { ActivityEventsModule } from '../activity-events/activity-events.module';
import { ACTIVITY_EVENT_REPOSITORY } from '../activity-events/application/activity-event.types';
import type { ActivityEventRepository } from '../activity-events/application/activity-event.types';
import { RegisterActivityEventUseCase } from '../activity-events/application/register-activity-event.use-case';
import { InspectionsModule } from '../inspections/inspections.module';
import { OBSERVATION_REPOSITORY } from '../inspections/application/observation.types';
import type { ObservationRepository } from '../inspections/application/observation.types';
import { AddAlertObservationUseCase } from '../inspections/application/add-alert-observation.use-case';
import { GetSyncStatusUseCase } from './application/get-sync-status.use-case';
import { SyncEventsUseCase } from './application/sync-events.use-case';
import { SyncIdempotencyService } from './application/sync-idempotency.service';
import { SyncObservationsUseCase } from './application/sync-observations.use-case';
import { OfflineSyncController } from './http/offline-sync.controller';
import { getSyncStatusUseCase, syncIdempotencyService } from './infrastructure/offline-sync-singletons';

@Module({
  imports: [ActivityEventsModule, InspectionsModule],
  controllers: [OfflineSyncController],
  providers: [
    {
      provide: SyncEventsUseCase,
      useFactory: (register: RegisterActivityEventUseCase, events: ActivityEventRepository) =>
        new SyncEventsUseCase(register, events, syncIdempotencyService as SyncIdempotencyService),
      inject: [RegisterActivityEventUseCase, ACTIVITY_EVENT_REPOSITORY]
    },
    {
      provide: SyncObservationsUseCase,
      useFactory: (addObservation: AddAlertObservationUseCase, observations: ObservationRepository) =>
        new SyncObservationsUseCase(addObservation, observations, syncIdempotencyService as SyncIdempotencyService),
      inject: [AddAlertObservationUseCase, OBSERVATION_REPOSITORY]
    },
    { provide: GetSyncStatusUseCase, useValue: getSyncStatusUseCase }
  ]
})
export class OfflineSyncModule {}
