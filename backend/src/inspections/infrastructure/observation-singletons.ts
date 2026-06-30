import { AddAlertObservationUseCase } from '../application/add-alert-observation.use-case';
import { ListAlertObservationsUseCase } from '../application/list-alert-observations.use-case';
import { MariaDbAlertRepository } from './mariadb-alert.repository';
import { MariaDbObservationRepository } from './mariadb-observation.repository';

export const sharedObservationRepository = new MariaDbObservationRepository();
export const sharedAlertRepository = new MariaDbAlertRepository();
export const addAlertObservationUseCase = new AddAlertObservationUseCase(sharedObservationRepository, sharedAlertRepository);
export const listAlertObservationsUseCase = new ListAlertObservationsUseCase(sharedObservationRepository, sharedAlertRepository);
