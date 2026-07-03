import type { Observation, ObservationDto } from '../domain/observation';

export type AddAlertObservationRequestDto = {
  observationId: string;
  comment: string;
  createdAt: string;
  clientId?: string;
};

export type AddAlertObservationCommand = AddAlertObservationRequestDto & {
  alertId: string;
  userId: string;
};

export type AlertObservationListDto = ObservationDto[];

export type ObservationRepository = {
  save(observation: Observation): Promise<Observation>;
  findByObservationId(observationId: string): Promise<Observation | null>;
  listByAlertId(alertId: string): Promise<Observation[]>;
};

export const OBSERVATION_REPOSITORY = Symbol('ObservationRepository');

export type AlertLookup = {
  exists(alertId: string): Promise<boolean>;
};
