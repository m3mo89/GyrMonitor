import { Module } from '@nestjs/common';

import { ActivityEventsController } from './http/activity-events.controller';

@Module({
  controllers: [ActivityEventsController]
})
export class ActivityEventsModule {}
