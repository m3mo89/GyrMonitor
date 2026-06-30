import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Roles, type Role } from '../src/authentication/domain/role';
import { AddAlertObservationUseCase } from '../src/inspections/application/add-alert-observation.use-case';
import { ListAlertObservationsUseCase } from '../src/inspections/application/list-alert-observations.use-case';
import { AlertNotFoundError, InvalidObservationInputError } from '../src/inspections/application/observation.errors';
import { ObservationsController } from '../src/inspections/http/observations.controller';
import { createHttpTestApp } from './http-test-app';

const alertId = '11111111-1111-4111-8111-111111111111';
const observationId = '22222222-2222-4222-8222-222222222222';
const userId = '33333333-3333-4333-8333-333333333333';

describe('ObservationsController e2e', () => {
  let app: INestApplication | undefined;
  let create: ReturnType<typeof vi.fn>;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  async function setup(options: { role?: Role; authMode?: 'unauthenticated' | 'authenticated'; createError?: Error; listError?: Error } = {}) {
    create = vi.fn(async () => {
      if (options.createError) throw options.createError;
      return { id: observationId, alertId, userId, comment: 'Checked in field', createdAt: '2026-06-30T02:00:00.000Z' };
    });

    app = await createHttpTestApp({
      controllers: [ObservationsController],
      authMode: options.authMode,
      user: { sub: userId, role: options.role ?? Roles.ADMIN },
      providers: [
        { provide: AddAlertObservationUseCase, useValue: { execute: create } },
        {
          provide: ListAlertObservationsUseCase,
          useValue: {
            execute: vi.fn(async () => {
              if (options.listError) throw options.listError;
              return [{ id: observationId, alertId, userId, comment: 'Checked in field', createdAt: '2026-06-30T02:00:00.000Z' }];
            })
          }
        }
      ]
    });
  }

  it('rejects unauthenticated and forbidden access', async () => {
    await setup({ authMode: 'unauthenticated' });
    await request(app!.getHttpAdapter().getInstance()).post(`/alerts/${alertId}/observations`).send({}).expect(401);
    await app!.close();

    await setup({ role: Roles.RESEARCHER });
    await request(app!.getHttpAdapter().getInstance()).post(`/alerts/${alertId}/observations`).send({}).expect(403);
  });

  it('creates observations with the authenticated user id', async () => {
    await setup({ role: Roles.FIELD_OPERATOR });

    await request(app!.getHttpAdapter().getInstance())
      .post(`/alerts/${alertId}/observations`)
      .send({ observationId, comment: 'Checked in field', createdAt: '2026-06-30T02:00:00.000Z' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.success).toBe(true);
        expect(body.data).toMatchObject({ id: observationId, alertId, userId });
      });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ alertId, observationId, userId }));
  });

  it('maps create validation and missing alert errors', async () => {
    await setup({ createError: new InvalidObservationInputError('invalid') });
    await request(app!.getHttpAdapter().getInstance()).post(`/alerts/${alertId}/observations`).send({}).expect(400).expect(({ body }) => expect(body.error.code).toBe('VALIDATION_ERROR'));
    await app!.close();

    await setup({ createError: new AlertNotFoundError(alertId) });
    await request(app!.getHttpAdapter().getInstance()).post(`/alerts/${alertId}/observations`).send({}).expect(404).expect(({ body }) => expect(body.error.code).toBe('NOT_FOUND'));
  });

  it('lists observations and maps missing alerts', async () => {
    await setup({ role: Roles.RESEARCHER });
    await request(app!.getHttpAdapter().getInstance()).get(`/alerts/${alertId}/observations`).expect(200).expect(({ body }) => {
      expect(body).toMatchObject({ success: true, data: [{ id: observationId, alertId, userId }] });
    });
    await app!.close();

    await setup({ listError: new AlertNotFoundError(alertId) });
    await request(app!.getHttpAdapter().getInstance()).get(`/alerts/${alertId}/observations`).expect(404).expect(({ body }) => expect(body.error.code).toBe('NOT_FOUND'));
  });
});
