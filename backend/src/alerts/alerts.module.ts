import { Module } from '@nestjs/common';

import { CattleMonitoringModule } from '../cattle-monitoring/cattle-monitoring.module';
import { CATTLE_REPOSITORY } from '../cattle-monitoring/application/cattle.types';
import type { CattleRepository } from '../cattle-monitoring/application/cattle.types';
import { InactivityAnalysisModule } from '../inactivity-analysis/inactivity-analysis.module';
import { GenerateAlertFromActivityEventUseCase } from './application/generate-alert-from-activity-event.use-case';
import { GetAlertDetailUseCase } from './application/get-alert-detail.use-case';
import { ListAlertsUseCase } from './application/list-alerts.use-case';
import { UpdateAlertStatusUseCase } from './application/update-alert-status.use-case';
import { AlertsController } from './http/alerts.controller';
import { RepositoryAlertCattleLookup } from './infrastructure/alert-lookups';
import {
  generateAlertFromActivityEventUseCase,
  sharedAlertEventLookup,
  sharedAlertRepository,
  updateAlertStatusUseCase
} from './infrastructure/alert-singletons';

@Module({
  imports: [InactivityAnalysisModule, CattleMonitoringModule],
  controllers: [AlertsController],
  providers: [
    {
      provide: RepositoryAlertCattleLookup,
      useFactory: (cattle: CattleRepository) => new RepositoryAlertCattleLookup(cattle),
      inject: [CATTLE_REPOSITORY]
    },
    { provide: GenerateAlertFromActivityEventUseCase, useValue: generateAlertFromActivityEventUseCase },
    {
      provide: ListAlertsUseCase,
      useFactory: (cattleLookup: RepositoryAlertCattleLookup) => new ListAlertsUseCase(sharedAlertRepository, cattleLookup),
      inject: [RepositoryAlertCattleLookup]
    },
    {
      provide: GetAlertDetailUseCase,
      useFactory: (cattleLookup: RepositoryAlertCattleLookup) =>
        new GetAlertDetailUseCase(sharedAlertRepository, cattleLookup, sharedAlertEventLookup),
      inject: [RepositoryAlertCattleLookup]
    },
    { provide: UpdateAlertStatusUseCase, useValue: updateAlertStatusUseCase }
  ],
  exports: [GenerateAlertFromActivityEventUseCase]
})
export class AlertsModule {}
