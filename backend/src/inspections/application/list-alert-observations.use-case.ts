import { toObservationDto } from '../domain/observation';
import { assertUuid } from '../../shared/validation/assertions';
import type { AlertLookup, AlertObservationListDto, ObservationRepository } from './observation.types';
import { AlertNotFoundError, InvalidObservationInputError } from './observation.errors';

export class ListAlertObservationsUseCase {
  private readonly observations: ObservationRepository;
  private readonly alerts: AlertLookup;

  constructor(
    observations: ObservationRepository,
    alerts: AlertLookup
  ) {
    this.observations = observations;
    this.alerts = alerts;
  }

  async execute(alertId: string): Promise<AlertObservationListDto> {
    try {
      assertUuid(alertId, 'alertId');

      if (!(await this.alerts.exists(alertId))) {
        throw new AlertNotFoundError(alertId);
      }

      const observations = await this.observations.listByAlertId(alertId);
      return observations.map(toObservationDto);
    } catch (error) {
      if (error instanceof AlertNotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new InvalidObservationInputError(error.message);
      }

      throw error;
    }
  }
}
