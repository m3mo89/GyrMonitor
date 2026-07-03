import { IdempotencyConflictError } from './offline-sync.errors';
import type { SyncLogRepository } from './offline-sync.types';
import { hashPayload, type SyncBatchResult, type SyncEndpoint } from '../domain/sync-log';
import { assertNonEmptyString } from '../../shared/validation/assertions';

export class SyncIdempotencyService {
  private readonly logs: SyncLogRepository;
  private readonly generateId: () => string;
  private readonly now: () => string;

  constructor(logs: SyncLogRepository, generateId: () => string = generateUuid, now: () => string = () => new Date().toISOString()) {
    this.logs = logs;
    this.generateId = generateId;
    this.now = now;
  }

  async resolve<TResult extends SyncBatchResult<unknown>>(params: {
    idempotencyKey: string;
    endpoint: SyncEndpoint;
    clientId?: string;
    deviceId?: string;
    payload: unknown;
    process: () => Promise<TResult>;
  }): Promise<TResult> {
    assertNonEmptyString(params.idempotencyKey, 'idempotencyKey');
    const payloadHash = hashPayload(params.payload);
    const existing = await this.logs.findByIdempotencyKey(params.idempotencyKey);

    if (existing) {
      if (existing.payloadHash !== payloadHash) {
        throw new IdempotencyConflictError();
      }

      return existing.responseBody as TResult;
    }

    const result = await params.process();

    await this.logs.record({
      id: this.generateId(),
      idempotencyKey: params.idempotencyKey,
      endpoint: params.endpoint,
      clientId: params.clientId,
      deviceId: params.deviceId,
      payloadHash,
      processed: result.processed,
      created: result.created,
      duplicates: result.duplicates,
      failed: result.failed,
      responseBody: result,
      createdAt: this.now()
    });

    return result;
  }
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16);
    const value = token === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
