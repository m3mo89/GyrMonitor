import { Module } from '@nestjs/common';

import { GenerateAlertFromActivityEventUseCase } from './application/generate-alert-from-activity-event.use-case';
import { GetAlertDetailUseCase } from './application/get-alert-detail.use-case';
import { ListAlertsUseCase } from './application/list-alerts.use-case';
import { UpdateAlertStatusUseCase } from './application/update-alert-status.use-case';
import { AlertsController } from './http/alerts.controller';
import {
  generateAlertFromActivityEventUseCase,
  getAlertDetailUseCase,
  listAlertsUseCase,
  updateAlertStatusUseCase
} from './infrastructure/alert-singletons';

@Module({
  controllers: [AlertsController],
  providers: [
    { provide: GenerateAlertFromActivityEventUseCase, useValue: generateAlertFromActivityEventUseCase },
    { provide: ListAlertsUseCase, useValue: listAlertsUseCase },
    { provide: GetAlertDetailUseCase, useValue: getAlertDetailUseCase },
    { provide: UpdateAlertStatusUseCase, useValue: updateAlertStatusUseCase }
  ],
  exports: [GenerateAlertFromActivityEventUseCase]
})
export class AlertsModule {}
