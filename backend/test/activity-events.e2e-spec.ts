import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Roles, type Role } from '../src/authentication/domain/role';
import { ActivityEventCattleNotFoundError, InvalidActivityEventInputError } from '../src/activity-events/application/activity-event.errors';
import { ListActivityEventsUseCase } from '../src/activity-events/application/list-activity-events.use-case';
import { RegisterActivityEventUseCase } from '../src/activity-events/application/register-activity-event.use-case';
import { EventTypes, SourceTypes } from '../src/activity-events/domain/activity-event';
import { ActivityEventsController } from '../src/activity-events/http/activity-events.controller';
import { createHttpTestApp } from './http-test-app';

const cattleId = '11111111-1111-4111-8111-111111111111';
const eventId = '22222222-2222-4222-8222-222222222222';

describe('ActivityEventsController e2e', () => {
  let app: INestApplication | undefined;
  let register: ReturnType<typeof vi.fn>;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  async function setup(options: { role?: Role; authMode?: 'unauthenticated' | 'authenticated'; createError?: Error; listError?: Error } = {}) {
    register = vi.fn(async () => {
      if (options.createError) throw options.createError;
      return { eventId, riskScore: null, severity: null, alertGenerated: false, alertId: null };
    });

    app = await createHttpTestApp({
      controllers: [ActivityEventsController],
      authMode: options.authMode,
      user: { sub: 'user-1', role: options.role ?? Roles.ADMIN },
      providers: [
        { provide: RegisterActivityEventUseCase, useValue: { execute: register } },
        {
          provide: ListActivityEventsUseCase,
          useValue: {
            execute: vi.fn(async () => {
              if (options.listError) throw options.listError;
              return {
                data: [
                  {
                    id: '33333333-3333-4333-8333-333333333333',
                    eventId,
                    deviceId: 'device-1',
                    cattleId,
                    eventType: EventTypes.INACTIVITY,
                    inactiveMinutes: 45,
                    confidence: 0.91,
                    capturedAt: '2026-06-30T01:00:00.000Z',
                    source: SourceTypes.DESKTOP_SIMULATOR,
                    createdAt: '2026-06-30T01:00:01.000Z'
                  }
                ],
                pagination: { page: 1, pageSize: 20, total: 1 }
              };
            })
          }
        }
      ]
    });
  }

  it('rejects unauthenticated and forbidden access', async () => {
    await setup({ authMode: 'unauthenticated' });
    await request(app!.getHttpAdapter().getInstance()).post('/events').send({}).expect(401);
    await app!.close();

    await setup({ role: Roles.RESEARCHER });
    await request(app!.getHttpAdapter().getInstance()).post('/events').send({}).expect(403);
  });

  it('creates events and forwards idempotency keys', async () => {
    await setup({ role: Roles.SYSTEM_GENERATOR });

    await request(app!.getHttpAdapter().getInstance())
      .post('/events')
      .set('idempotency-key', 'idem-1')
      .send({ eventId, deviceId: 'device-1', cattleId, eventType: EventTypes.INACTIVITY, inactiveMinutes: 45, confidence: 0.91, capturedAt: '2026-06-30T01:00:00.000Z', source: SourceTypes.DESKTOP_SIMULATOR })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({ success: true, data: { eventId, riskScore: null, severity: null, alertGenerated: false, alertId: null } });
      });
    expect(register).toHaveBeenCalledWith(expect.objectContaining({ eventId, idempotencyKey: 'idem-1' }));
  });

  it('maps create validation and not-found errors', async () => {
    await setup({ createError: new InvalidActivityEventInputError('invalid') });
    await request(app!.getHttpAdapter().getInstance()).post('/events').send({}).expect(400).expect(({ body }) => expect(body.error.code).toBe('VALIDATION_ERROR'));
    await app!.close();

    await setup({ createError: new ActivityEventCattleNotFoundError() });
    await request(app!.getHttpAdapter().getInstance()).post('/events').send({}).expect(404).expect(({ body }) => expect(body.error.code).toBe('NOT_FOUND'));
  });

  it('lists events with pagination and maps invalid filters', async () => {
    await setup({ role: Roles.RESEARCHER });
    await request(app!.getHttpAdapter().getInstance()).get('/events?page=1&pageSize=20').expect(200).expect(({ body }) => {
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.pagination).toEqual({ page: 1, pageSize: 20, total: 1 });
    });
    await app!.close();

    await setup({ listError: new InvalidActivityEventInputError('invalid') });
    await request(app!.getHttpAdapter().getInstance()).get('/events?eventType=UNKNOWN').expect(400).expect(({ body }) => expect(body.error.code).toBe('VALIDATION_ERROR'));
  });
});
