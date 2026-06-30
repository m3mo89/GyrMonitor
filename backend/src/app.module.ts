import { Module } from '@nestjs/common';

import { AuthenticationModule } from './authentication/authentication.module';
import { CattleMonitoringModule } from './cattle-monitoring/cattle-monitoring.module';

@Module({
  imports: [AuthenticationModule, CattleMonitoringModule]
})
export class AppModule {}
