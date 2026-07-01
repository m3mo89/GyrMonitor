import { describe, expect, it, vi } from 'vitest';

import { GetSyncStatusUseCase } from './get-sync-status.use-case';
import { IdempotencyConflictError, InvalidSyncInputError } from './offline-sync.errors';
import { SyncEventsUseCase } from './sync-events.use-case';
import { SyncIdempotencyService } from './sync-idempotency.service';
import { SyncObservationsUseCase } from './sync-observations.use-case';
import type { SyncEventItemRequestDto, SyncObservationItemRequestDto } from './offline-sync.types';
import { LocalSyncLogRepository } from '../infrastructure/local-sync-log.repository';

const cattleId = '11111111-1111-4111-8111-111111111111';
const eventId = '22222222-2222-4222-8222-222222222222';
const alertId = '33333333-3333-4333-8333-333333333333';
const observationId = '44444444-4444-4444-8444-444444444444';
const userId = '55555555-5555-4555-8555-555555555555';

function eventItem(overrides: Partial<SyncEventItemRequestDto> = {}): SyncEventItemRequestDto {
  return {
    localId: 'local-event-1',
    eventId,
    cattleId,
    eventType: 'INACTIVITY',
    inactiveMinutes: 45,
    confidence: 0.9,
    capturedAt: '2026-06-30T01:00:00.000Z',
    source: 'MOBILE_CLIENT',
    ...overrides
  };
}

function observationItem(overrides: Partial<SyncObservationItemRequestDto> = {}): SyncObservationItemRequestDto {
  return {
    localId: 'local-obs-1',
    observationId,
    alertId,
    comment: 'Checked in field',
    createdAt: '2026-06-30T02:00:00.000Z',
    ...overrides
  };
}

describe('SyncEventsUseCase', () => {
  function build(existing: boolean | Error = false) {
    const register = vi.fn(async () => ({ eventId, riskScore: null, severity: null, alertGenerated: false, alertId: null }));
    const events = {
      save: vi.fn(),
      list: vi.fn(),
      findByEventId: vi.fn(async () => (existing === true ? { id: 'x' } : null))
    };

    const logs = new LocalSyncLogRepository();
    const idempotency = new SyncIdempotencyService(logs);
    const useCase = new SyncEventsUseCase({ execute: register } as never, events as never, idempotency);
    return { register, events, useCase, idempotency };
  }

  it('registers new items and preserves capturedAt/source through delegation', async () => {
    const { register, useCase } = build();

    const result = await useCase.execute({
      clientId: 'MOBILE-001',
      deviceId: 'DEVICE-001',
      idempotencyKey: 'idem-1',
      items: [eventItem()]
    });

    expect(result).toEqual({
      processed: 1,
      created: 1,
      duplicates: 0,
      failed: 0,
      results: [{ localId: 'local-event-1', eventId, status: 'SYNCED', serverId: eventId }]
    });
    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId,
        deviceId: 'DEVICE-001',
        capturedAt: '2026-06-30T01:00:00.000Z',
        source: 'MOBILE_CLIENT'
      })
    );
  });

  it('reports duplicate items without failing the batch', async () => {
    const { useCase } = build(true);

    const result = await useCase.execute({
      clientId: 'MOBILE-001',
      deviceId: 'DEVICE-001',
      idempotencyKey: 'idem-2',
      items: [eventItem()]
    });

    expect(result).toMatchObject({ processed: 1, created: 0, duplicates: 1, failed: 0 });
    expect(result.results[0]).toMatchObject({ status: 'DUPLICATE' });
  });

  it('reports per-item failures without failing the whole batch', async () => {
    const register = vi
      .fn()
      .mockResolvedValueOnce({ eventId: 'valid', riskScore: null, severity: null, alertGenerated: false, alertId: null })
      .mockRejectedValueOnce(new Error('Cattle record was not found.'));
    const events = { save: vi.fn(), list: vi.fn(), findByEventId: vi.fn(async () => null) };
    const idempotency = new SyncIdempotencyService(new LocalSyncLogRepository());
    const useCase = new SyncEventsUseCase({ execute: register } as never, events as never, idempotency);

    const result = await useCase.execute({
      clientId: 'MOBILE-001',
      deviceId: 'DEVICE-001',
      idempotencyKey: 'idem-3',
      items: [eventItem({ localId: 'local-a', eventId: 'valid' }), eventItem({ localId: 'local-b', eventId: 'invalid-cattle' })]
    });

    expect(result).toMatchObject({ processed: 2, created: 1, duplicates: 0, failed: 1 });
    expect(result.results[1]).toMatchObject({ localId: 'local-b', status: 'FAILED', message: 'Cattle record was not found.' });
  });

  it('replays the recorded result for a retried idempotency key with the same payload', async () => {
    const { register, useCase } = build();
    const command = { clientId: 'MOBILE-001', deviceId: 'DEVICE-001', idempotencyKey: 'idem-4', items: [eventItem()] };

    const first = await useCase.execute(command);
    const second = await useCase.execute(command);

    expect(second).toEqual(first);
    expect(register).toHaveBeenCalledTimes(1);
  });

  it('rejects a retried idempotency key used with a different payload', async () => {
    const { useCase } = build();

    await useCase.execute({ clientId: 'MOBILE-001', deviceId: 'DEVICE-001', idempotencyKey: 'idem-5', items: [eventItem()] });

    await expect(
      useCase.execute({
        clientId: 'MOBILE-001',
        deviceId: 'DEVICE-001',
        idempotencyKey: 'idem-5',
        items: [eventItem({ localId: 'different-local-id' })]
      })
    ).rejects.toBeInstanceOf(IdempotencyConflictError);
  });

  it('rejects an empty batch and a missing idempotency key', async () => {
    const { useCase } = build();

    await expect(useCase.execute({ idempotencyKey: 'idem-6', items: [] })).rejects.toBeInstanceOf(InvalidSyncInputError);
    await expect(useCase.execute({ idempotencyKey: '', items: [eventItem()] })).rejects.toBeInstanceOf(InvalidSyncInputError);
  });
});

describe('SyncObservationsUseCase', () => {
  function build(existing: boolean | Error = false) {
    const addObservation = vi.fn(async () => ({ id: 'server-observation-id', alertId, userId, comment: 'Checked in field', createdAt: '2026-06-30T02:00:00.000Z' }));
    const observations = {
      save: vi.fn(),
      listByAlertId: vi.fn(),
      findByObservationId: vi.fn(async () => (existing === true ? { id: 'x' } : null))
    };

    const logs = new LocalSyncLogRepository();
    const idempotency = new SyncIdempotencyService(logs);
    const useCase = new SyncObservationsUseCase({ execute: addObservation } as never, observations as never, idempotency);
    return { addObservation, observations, useCase };
  }

  it('registers new observations and preserves createdAt through delegation', async () => {
    const { addObservation, useCase } = build();

    const result = await useCase.execute({
      clientId: 'MOBILE-001',
      idempotencyKey: 'idem-1',
      userId,
      items: [observationItem()]
    });

    expect(result).toEqual({
      processed: 1,
      created: 1,
      duplicates: 0,
      failed: 0,
      results: [{ localId: 'local-obs-1', observationId, status: 'SYNCED', serverId: 'server-observation-id' }]
    });
    expect(addObservation).toHaveBeenCalledWith(
      expect.objectContaining({ observationId, alertId, userId, createdAt: '2026-06-30T02:00:00.000Z' })
    );
  });

  it('reports duplicate observations without failing the batch', async () => {
    const { useCase } = build(true);

    const result = await useCase.execute({ clientId: 'MOBILE-001', idempotencyKey: 'idem-2', userId, items: [observationItem()] });

    expect(result).toMatchObject({ processed: 1, created: 0, duplicates: 1, failed: 0 });
    expect(result.results[0]).toMatchObject({ status: 'DUPLICATE' });
  });

  it('reports a failed item when the referenced alert does not exist', async () => {
    const addObservation = vi.fn().mockRejectedValueOnce(new Error('Alert not found: missing-alert'));
    const observations = { save: vi.fn(), listByAlertId: vi.fn(), findByObservationId: vi.fn(async () => null) };
    const idempotency = new SyncIdempotencyService(new LocalSyncLogRepository());
    const useCase = new SyncObservationsUseCase({ execute: addObservation } as never, observations as never, idempotency);

    const result = await useCase.execute({
      clientId: 'MOBILE-001',
      idempotencyKey: 'idem-3',
      userId,
      items: [observationItem({ alertId: 'missing-alert' })]
    });

    expect(result).toMatchObject({ processed: 1, created: 0, duplicates: 0, failed: 1 });
    expect(result.results[0]).toMatchObject({ status: 'FAILED', message: 'Alert not found: missing-alert' });
  });

  it('replays the recorded result for a retried idempotency key with the same payload', async () => {
    const { addObservation, useCase } = build();
    const command = { clientId: 'MOBILE-001', idempotencyKey: 'idem-4', userId, items: [observationItem()] };

    const first = await useCase.execute(command);
    const second = await useCase.execute(command);

    expect(second).toEqual(first);
    expect(addObservation).toHaveBeenCalledTimes(1);
  });
});

describe('GetSyncStatusUseCase', () => {
  it('returns recent attempts for a client id', async () => {
    const logs = new LocalSyncLogRepository();
    await logs.record({
      id: 'log-1',
      idempotencyKey: 'idem-1',
      endpoint: 'events',
      clientId: 'MOBILE-001',
      deviceId: 'DEVICE-001',
      payloadHash: 'hash',
      processed: 2,
      created: 1,
      duplicates: 1,
      failed: 0,
      responseBody: {},
      createdAt: '2026-06-30T03:00:00.000Z'
    });

    const useCase = new GetSyncStatusUseCase(logs);
    const result = await useCase.execute({ clientId: 'MOBILE-001' });

    expect(result.attempts).toEqual([
      {
        endpoint: 'events',
        clientId: 'MOBILE-001',
        deviceId: 'DEVICE-001',
        processed: 2,
        created: 1,
        duplicates: 1,
        failed: 0,
        syncedAt: '2026-06-30T03:00:00.000Z'
      }
    ]);
  });

  it('falls back to the recent global list when no client id is provided', async () => {
    const logs = new LocalSyncLogRepository();
    const useCase = new GetSyncStatusUseCase(logs);

    await expect(useCase.execute({})).resolves.toEqual({ attempts: [] });
  });
});
