import { Module } from '@nestjs/common';

import { AddAlertObservationUseCase } from './application/add-alert-observation.use-case';
import { ListAlertObservationsUseCase } from './application/list-alert-observations.use-case';
import { OBSERVATION_REPOSITORY } from './application/observation.types';
import { ObservationsController } from './http/observations.controller';
import {
  addAlertObservationUseCase,
  listAlertObservationsUseCase,
  sharedObservationRepository
} from './infrastructure/observation-singletons';

@Module({
  controllers: [ObservationsController],
  providers: [
    { provide: AddAlertObservationUseCase, useValue: addAlertObservationUseCase },
    { provide: ListAlertObservationsUseCase, useValue: listAlertObservationsUseCase },
    { provide: OBSERVATION_REPOSITORY, useValue: sharedObservationRepository }
  ],
  exports: [AddAlertObservationUseCase, OBSERVATION_REPOSITORY]
})
export class InspectionsModule {}
