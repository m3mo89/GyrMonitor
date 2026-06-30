import { Module } from '@nestjs/common';

import { AddAlertObservationUseCase } from './application/add-alert-observation.use-case';
import { ListAlertObservationsUseCase } from './application/list-alert-observations.use-case';
import { ObservationsController } from './http/observations.controller';
import { addAlertObservationUseCase, listAlertObservationsUseCase } from './infrastructure/observation-singletons';

@Module({
  controllers: [ObservationsController],
  providers: [
    { provide: AddAlertObservationUseCase, useValue: addAlertObservationUseCase },
    { provide: ListAlertObservationsUseCase, useValue: listAlertObservationsUseCase }
  ]
})
export class InspectionsModule {}
