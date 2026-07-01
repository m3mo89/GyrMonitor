import { InvalidSyncInputError } from './offline-sync.errors';
import { SyncIdempotencyService } from './sync-idempotency.service';
import type { SyncObservationItemResultDto, SyncObservationsCommand, SyncObservationsResultDto } from './offline-sync.types';
import { SyncEndpoints, SyncItemStatuses } from '../domain/sync-log';
import type { AddAlertObservationUseCase } from '../../inspections/application/add-alert-observation.use-case';
import type { ObservationRepository } from '../../inspections/application/observation.types';

export class SyncObservationsUseCase {
  private readonly addObservation: AddAlertObservationUseCase;
  private readonly observations: ObservationRepository;
  private readonly idempotency: SyncIdempotencyService;

  constructor(addObservation: AddAlertObservationUseCase, observations: ObservationRepository, idempotency: SyncIdempotencyService) {
    this.addObservation = addObservation;
    this.observations = observations;
    this.idempotency = idempotency;
  }

  async execute(command: SyncObservationsCommand): Promise<SyncObservationsResultDto> {
    if (typeof command.idempotencyKey !== 'string' || command.idempotencyKey.trim().length === 0) {
      throw new InvalidSyncInputError('idempotencyKey must not be empty.');
    }

    if (!Array.isArray(command.items) || command.items.length === 0) {
      throw new InvalidSyncInputError('items must be a non-empty array.');
    }

    return this.idempotency.resolve<SyncObservationsResultDto>({
      idempotencyKey: command.idempotencyKey,
      endpoint: SyncEndpoints.OBSERVATIONS,
      clientId: command.clientId,
      payload: { clientId: command.clientId, items: command.items },
      process: () => this.processBatch(command)
    });
  }

  private async processBatch(command: SyncObservationsCommand): Promise<SyncObservationsResultDto> {
    const results: SyncObservationItemResultDto[] = [];
    let created = 0;
    let duplicates = 0;
    let failed = 0;

    for (const item of command.items) {
      try {
        const alreadyExists = Boolean(await this.observations.findByObservationId(item.observationId));

        const response = await this.addObservation.execute({
          alertId: item.alertId,
          observationId: item.observationId,
          comment: item.comment,
          createdAt: item.createdAt,
          clientId: item.clientId,
          userId: command.userId
        });

        if (alreadyExists) {
          duplicates += 1;
          results.push({
            localId: item.localId,
            observationId: item.observationId,
            status: SyncItemStatuses.DUPLICATE,
            serverId: response.id
          });
        } else {
          created += 1;
          results.push({
            localId: item.localId,
            observationId: item.observationId,
            status: SyncItemStatuses.SYNCED,
            serverId: response.id
          });
        }
      } catch (error) {
        failed += 1;
        results.push({
          localId: item.localId,
          observationId: item.observationId,
          status: SyncItemStatuses.FAILED,
          message: error instanceof Error ? error.message : 'Unexpected sync error.'
        });
      }
    }

    return { processed: command.items.length, created, duplicates, failed, results };
  }
}
