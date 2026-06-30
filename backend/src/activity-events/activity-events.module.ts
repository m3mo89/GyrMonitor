import { Module } from '@nestjs/common';

import { ListActivityEventsUseCase } from './application/list-activity-events.use-case';
import { RegisterActivityEventUseCase } from './application/register-activity-event.use-case';
import { ActivityEventsController } from './http/activity-events.controller';
import { listActivityEventsUseCase, registerActivityEventUseCase } from './infrastructure/activity-event-singletons';

@Module({
  controllers: [ActivityEventsController],
  providers: [
    { provide: RegisterActivityEventUseCase, useValue: registerActivityEventUseCase },
    { provide: ListActivityEventsUseCase, useValue: listActivityEventsUseCase }
  ]
})
export class ActivityEventsModule {}
