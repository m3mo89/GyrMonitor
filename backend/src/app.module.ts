import { Module } from '@nestjs/common';

import { ActivityEventsModule } from './activity-events/activity-events.module';
import { AppController } from './app.controller';
import { AlertsModule } from './alerts/alerts.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { CattleMonitoringModule } from './cattle-monitoring/cattle-monitoring.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InactivityAnalysisModule } from './inactivity-analysis/inactivity-analysis.module';
import { InspectionsModule } from './inspections/inspections.module';
import { OfflineSyncModule } from './offline-sync/offline-sync.module';
import { UserManagementModule } from './user-management/user-management.module';

@Module({
  imports: [
    AuthenticationModule,
    UserManagementModule,
    CattleMonitoringModule,
    ActivityEventsModule,
    InactivityAnalysisModule,
    AlertsModule,
    InspectionsModule,
    DashboardModule,
    OfflineSyncModule
  ],
  controllers: [AppController]
})
export class AppModule {}
