import { Module } from '@nestjs/common';

import { ACTIVITY_EVENT_REPOSITORY } from './application/activity-event.types';
import { ListActivityEventsUseCase } from './application/list-activity-events.use-case';
import { RegisterActivityEventUseCase } from './application/register-activity-event.use-case';
import { ActivityEventsController } from './http/activity-events.controller';
import {
  listActivityEventsUseCase,
  registerActivityEventUseCase,
  sharedActivityEventRepository
} from './infrastructure/activity-event-singletons';

@Module({
  controllers: [ActivityEventsController],
  providers: [
    { provide: RegisterActivityEventUseCase, useValue: registerActivityEventUseCase },
    { provide: ListActivityEventsUseCase, useValue: listActivityEventsUseCase },
    { provide: ACTIVITY_EVENT_REPOSITORY, useValue: sharedActivityEventRepository }
  ],
  exports: [ACTIVITY_EVENT_REPOSITORY, RegisterActivityEventUseCase]
})
export class ActivityEventsModule {}
