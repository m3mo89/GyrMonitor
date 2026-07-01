import { InvalidSyncInputError } from './offline-sync.errors';
import { SyncIdempotencyService } from './sync-idempotency.service';
import type { SyncEventItemResultDto, SyncEventsCommand, SyncEventsResultDto } from './offline-sync.types';
import { SyncEndpoints, SyncItemStatuses } from '../domain/sync-log';
import type { ActivityEventRepository } from '../../activity-events/application/activity-event.types';
import type { RegisterActivityEventUseCase } from '../../activity-events/application/register-activity-event.use-case';

export class SyncEventsUseCase {
  private readonly register: RegisterActivityEventUseCase;
  private readonly events: ActivityEventRepository;
  private readonly idempotency: SyncIdempotencyService;

  constructor(register: RegisterActivityEventUseCase, events: ActivityEventRepository, idempotency: SyncIdempotencyService) {
    this.register = register;
    this.events = events;
    this.idempotency = idempotency;
  }

  async execute(command: SyncEventsCommand): Promise<SyncEventsResultDto> {
    if (typeof command.idempotencyKey !== 'string' || command.idempotencyKey.trim().length === 0) {
      throw new InvalidSyncInputError('idempotencyKey must not be empty.');
    }

    if (!Array.isArray(command.items) || command.items.length === 0) {
      throw new InvalidSyncInputError('items must be a non-empty array.');
    }

    return this.idempotency.resolve<SyncEventsResultDto>({
      idempotencyKey: command.idempotencyKey,
      endpoint: SyncEndpoints.EVENTS,
      clientId: command.clientId,
      deviceId: command.deviceId,
      payload: { clientId: command.clientId, deviceId: command.deviceId, items: command.items },
      process: () => this.processBatch(command)
    });
  }

  private async processBatch(command: SyncEventsCommand): Promise<SyncEventsResultDto> {
    const results: SyncEventItemResultDto[] = [];
    let created = 0;
    let duplicates = 0;
    let failed = 0;

    for (const item of command.items) {
      try {
        const alreadyExists = Boolean(await this.events.findByEventId(item.eventId));

        const response = await this.register.execute({
          eventId: item.eventId,
          deviceId: command.deviceId ?? '',
          cattleId: item.cattleId,
          eventType: item.eventType,
          inactiveMinutes: item.inactiveMinutes,
          confidence: item.confidence,
          capturedAt: item.capturedAt,
          source: item.source
        });

        if (alreadyExists) {
          duplicates += 1;
          results.push({ localId: item.localId, eventId: item.eventId, status: SyncItemStatuses.DUPLICATE, serverId: response.eventId });
        } else {
          created += 1;
          results.push({ localId: item.localId, eventId: item.eventId, status: SyncItemStatuses.SYNCED, serverId: response.eventId });
        }
      } catch (error) {
        failed += 1;
        results.push({
          localId: item.localId,
          eventId: item.eventId,
          status: SyncItemStatuses.FAILED,
          message: error instanceof Error ? error.message : 'Unexpected sync error.'
        });
      }
    }

    return { processed: command.items.length, created, duplicates, failed, results };
  }
}
