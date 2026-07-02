import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Roles, type Role } from '../src/authentication/domain/role';
import { IdempotencyConflictError, InvalidSyncInputError } from '../src/offline-sync/application/offline-sync.errors';
import { GetSyncStatusUseCase } from '../src/offline-sync/application/get-sync-status.use-case';
import { SyncEventsUseCase } from '../src/offline-sync/application/sync-events.use-case';
import { SyncObservationsUseCase } from '../src/offline-sync/application/sync-observations.use-case';
import { OfflineSyncController } from '../src/offline-sync/http/offline-sync.controller';
import { createHttpTestApp } from './http-test-app';

const eventId = '11111111-1111-4111-8111-111111111111';
const observationId = '22222222-2222-4222-8222-222222222222';
const userId = '33333333-3333-4333-8333-333333333333';

describe('OfflineSyncController e2e', () => {
  let app: INestApplication | undefined;
  let syncEvents: ReturnType<typeof vi.fn>;
  let syncObservations: ReturnType<typeof vi.fn>;
  let getStatus: ReturnType<typeof vi.fn>;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  async function setup(
    options: {
      role?: Role;
      authMode?: 'unauthenticated' | 'authenticated';
      eventsError?: Error;
      observationsError?: Error;
    } = {}
  ) {
    syncEvents = vi.fn(async () => {
      if (options.eventsError) throw options.eventsError;
      return { processed: 1, created: 1, duplicates: 0, failed: 0, results: [{ localId: 'local-1', eventId, status: 'SYNCED', serverId: eventId }] };
    });

    syncObservations = vi.fn(async () => {
      if (options.observationsError) throw options.observationsError;
      return {
        processed: 1,
        created: 1,
        duplicates: 0,
        failed: 0,
        results: [{ localId: 'local-2', observationId, status: 'SYNCED', serverId: 'server-observation-id' }]
      };
    });

    getStatus = vi.fn(async () => ({ attempts: [] }));

    app = await createHttpTestApp({
      controllers: [OfflineSyncController],
      authMode: options.authMode,
      user: { sub: userId, role: options.role ?? Roles.ADMIN },
      providers: [
        { provide: SyncEventsUseCase, useValue: { execute: syncEvents } },
        { provide: SyncObservationsUseCase, useValue: { execute: syncObservations } },
        { provide: GetSyncStatusUseCase, useValue: { execute: getStatus } }
      ]
    });
  }

  it('rejects unauthenticated and forbidden access to sync events', async () => {
    await setup({ authMode: 'unauthenticated' });
    await request(app!.getHttpAdapter().getInstance()).post('/sync/events').send({}).expect(401);
    await app!.close();

    await setup({ role: Roles.RESEARCHER });
    await request(app!.getHttpAdapter().getInstance()).post('/sync/events').send({}).expect(403);
  });

  it('syncs events and forwards the idempotency key', async () => {
    await setup({ role: Roles.SYSTEM_GENERATOR });

    await request(app!.getHttpAdapter().getInstance())
      .post('/sync/events')
      .set('idempotency-key', 'idem-1')
      .send({ clientId: 'MOBILE-001', deviceId: 'DEVICE-001', items: [{ localId: 'local-1', eventId, cattleId: 'cattle-1', eventType: 'INACTIVITY', confidence: 0.9, capturedAt: '2026-06-30T01:00:00.000Z', source: 'MOBILE_CLIENT' }] })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          success: true,
          data: { processed: 1, created: 1, duplicates: 0, failed: 0, results: [{ localId: 'local-1', eventId, status: 'SYNCED', serverId: eventId }] }
        });
      });

    expect(syncEvents).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: 'idem-1', clientId: 'MOBILE-001', deviceId: 'DEVICE-001' }));
  });

  it('rejects sync events without an idempotency key', async () => {
    await setup({ role: Roles.ADMIN, eventsError: new InvalidSyncInputError('idempotencyKey must not be empty.') });

    await request(app!.getHttpAdapter().getInstance())
      .post('/sync/events')
      .send({ items: [] })
      .expect(400)
      .expect(({ body }) => expect(body.error.code).toBe('VALIDATION_ERROR'));
  });

  it('maps idempotency conflicts to 409', async () => {
    await setup({ role: Roles.ADMIN, eventsError: new IdempotencyConflictError() });

    await request(app!.getHttpAdapter().getInstance())
      .post('/sync/events')
      .set('idempotency-key', 'idem-1')
      .send({ items: [] })
      .expect(409)
      .expect(({ body }) => expect(body.error.code).toBe('IDEMPOTENCY_CONFLICT'));
  });

  it('syncs observations using the authenticated user id', async () => {
    await setup({ role: Roles.FIELD_OPERATOR });

    await request(app!.getHttpAdapter().getInstance())
      .post('/sync/observations')
      .set('idempotency-key', 'idem-2')
      .send({
        clientId: 'MOBILE-001',
        items: [
          {
            localId: 'local-2',
            observationId,
            alertId: 'alert-1',
            comment: 'Checked',
            createdAt: '2026-06-30T02:00:00.000Z',
            ownerUserId: 'client-side-user-id-must-not-win'
          }
        ]
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.data.results[0]).toMatchObject({ status: 'SYNCED', serverId: 'server-observation-id' });
      });

    expect(syncObservations).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: 'idem-2', userId }));
    expect(syncObservations).not.toHaveBeenCalledWith(expect.objectContaining({ userId: 'client-side-user-id-must-not-win' }));
  });

  it('rejects unauthorized roles for sync observations', async () => {
    await setup({ role: Roles.SYSTEM_GENERATOR });
    await request(app!.getHttpAdapter().getInstance()).post('/sync/observations').send({}).expect(403);
  });

  it('returns sync status for authorized users', async () => {
    await setup({ role: Roles.FIELD_OPERATOR });

    await request(app!.getHttpAdapter().getInstance())
      .get('/sync/status?clientId=MOBILE-001')
      .expect(200)
      .expect(({ body }) => expect(body).toEqual({ success: true, data: { attempts: [] } }));

    expect(getStatus).toHaveBeenCalledWith({ clientId: 'MOBILE-001' });
  });

  it('rejects unauthenticated access to sync status', async () => {
    await setup({ authMode: 'unauthenticated' });
    await request(app!.getHttpAdapter().getInstance()).get('/sync/status').expect(401);
  });
});
