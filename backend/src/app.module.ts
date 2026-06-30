import { Module } from '@nestjs/common';

import { ActivityEventsModule } from './activity-events/activity-events.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { CattleMonitoringModule } from './cattle-monitoring/cattle-monitoring.module';
import { InspectionsModule } from './inspections/inspections.module';

@Module({
  imports: [AuthenticationModule, CattleMonitoringModule, ActivityEventsModule, InspectionsModule]
})
export class AppModule {}
