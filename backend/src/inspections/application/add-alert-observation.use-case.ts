import { createObservation, toObservationDto } from '../domain/observation';
import type { AddAlertObservationCommand, AlertLookup, ObservationRepository } from './observation.types';
import type { ObservationDto } from '../domain/observation';
import { AlertNotFoundError, InvalidObservationInputError } from './observation.errors';

export class AddAlertObservationUseCase {
  private readonly observations: ObservationRepository;
  private readonly alerts: AlertLookup;
  private readonly generateId: () => string;

  constructor(
    observations: ObservationRepository,
    alerts: AlertLookup,
    generateId: () => string = generateUuid
  ) {
    this.observations = observations;
    this.alerts = alerts;
    this.generateId = generateId;
  }

  async execute(command: AddAlertObservationCommand): Promise<ObservationDto> {
    try {
      const existing = await this.observations.findByObservationId(command.observationId);
      if (existing) {
        return toObservationDto(existing);
      }

      if (!(await this.alerts.exists(command.alertId))) {
        throw new AlertNotFoundError(command.alertId);
      }

      const observation = createObservation({
        id: this.generateId(),
        observationId: command.observationId,
        alertId: command.alertId,
        userId: command.userId,
        comment: command.comment,
        createdAt: command.createdAt,
        clientId: command.clientId
      });

      return toObservationDto(await this.observations.save(observation));
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

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16);
    const value = token === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
