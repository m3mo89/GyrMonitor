import { Module } from '@nestjs/common';

import { GetCattleDetailUseCase } from './application/get-cattle-detail.use-case';
import { GetCattleHistoryUseCase } from './application/get-cattle-history.use-case';
import { ListCattleUseCase } from './application/list-cattle.use-case';
import { CattleController } from './http/cattle.controller';
import { getCattleDetailUseCase, listCattleUseCase } from './infrastructure/cattle-singletons';
import { sharedCattleRepository } from './infrastructure/cattle-repository-singleton';
import { CATTLE_REPOSITORY } from './application/cattle.types';
import { ActivityEventsModule } from '../activity-events/activity-events.module';
import { ACTIVITY_EVENT_REPOSITORY } from '../activity-events/application/activity-event.types';
import type { ActivityEventRepository } from '../activity-events/application/activity-event.types';

@Module({
  imports: [ActivityEventsModule],
  controllers: [CattleController],
  providers: [
    { provide: ListCattleUseCase, useValue: listCattleUseCase },
    { provide: GetCattleDetailUseCase, useValue: getCattleDetailUseCase },
    { provide: CATTLE_REPOSITORY, useValue: sharedCattleRepository },
    {
      provide: GetCattleHistoryUseCase,
      useFactory: (activityEvents: ActivityEventRepository) =>
        new GetCattleHistoryUseCase(sharedCattleRepository, activityEvents),
      inject: [ACTIVITY_EVENT_REPOSITORY]
    }
  ],
  exports: [CATTLE_REPOSITORY]
})
export class CattleMonitoringModule {}
