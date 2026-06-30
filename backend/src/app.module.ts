import { Module } from '@nestjs/common';

import { AuthenticationModule } from './authentication/authentication.module';
import { CattleMonitoringModule } from './cattle-monitoring/cattle-monitoring.module';
import { InspectionsModule } from './inspections/inspections.module';

@Module({
  imports: [AuthenticationModule, CattleMonitoringModule, InspectionsModule]
})
export class AppModule {}
