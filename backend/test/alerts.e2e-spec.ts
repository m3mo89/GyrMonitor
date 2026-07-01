import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GetAlertDetailUseCase } from '../src/alerts/application/get-alert-detail.use-case';
import { ListAlertsUseCase } from '../src/alerts/application/list-alerts.use-case';
import { UpdateAlertStatusUseCase } from '../src/alerts/application/update-alert-status.use-case';
import { AlertNotFoundError, InvalidAlertInputError } from '../src/alerts/application/alert.errors';
import { AlertsController } from '../src/alerts/http/alerts.controller';
import { Roles, type Role } from '../src/authentication/domain/role';
import { createHttpTestApp } from './http-test-app';

const alertId = '11111111-1111-4111-8111-111111111111';
const cattleId = '22222222-2222-4222-8222-222222222222';
const eventId = '33333333-3333-4333-8333-333333333333';
const userId = '44444444-4444-4444-8444-444444444444';

describe('AlertsController e2e', () => {
  let app: INestApplication | undefined;
  let list: ReturnType<typeof vi.fn>;
  let detail: ReturnType<typeof vi.fn>;
  let updateStatus: ReturnType<typeof vi.fn>;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  async function setup(
    options: {
      role?: Role;
      authMode?: 'unauthenticated' | 'authenticated';
      listError?: Error;
      detailError?: Error;
      updateError?: Error;
    } = {}
  ) {
    list = vi.fn(async () => {
      if (options.listError) throw options.listError;
      return {
        data: [
          {
            id: alertId,
            cattleId,
            tagNumber: 'GYR-023',
            severity: 'HIGH',
            riskScore: 90,
            status: 'PENDING',
            reason: 'Inactividad prolongada',
            createdAt: '2026-06-30T01:00:00.000Z'
          }
        ],
        pagination: { page: 1, pageSize: 20, total: 1 }
      };
    });
    detail = vi.fn(async () => {
      if (options.detailError) throw options.detailError;
      return {
        id: alertId,
        cattleId,
        tagNumber: 'GYR-023',
        eventId,
        severity: 'HIGH',
        riskScore: 90,
        status: 'PENDING',
        reason: 'Inactividad prolongada',
        createdAt: '2026-06-30T01:00:00.000Z',
        attendedAt: null
      };
    });
    updateStatus = vi.fn(async () => {
      if (options.updateError) throw options.updateError;
      return {
        id: alertId,
        status: 'ATTENDED',
        attendedAt: '2026-06-30T02:00:00.000Z'
      };
    });

    app = await createHttpTestApp({
      controllers: [AlertsController],
      authMode: options.authMode,
      user: { sub: userId, role: options.role ?? Roles.ADMIN },
      providers: [
        { provide: ListAlertsUseCase, useValue: { execute: list } },
        { provide: GetAlertDetailUseCase, useValue: { execute: detail } },
        { provide: UpdateAlertStatusUseCase, useValue: { execute: updateStatus } }
      ]
    });
  }

  it('rejects unauthenticated and forbidden status updates', async () => {
    await setup({ authMode: 'unauthenticated' });
    await request(app!.getHttpAdapter().getInstance()).get('/alerts').expect(401);
    await app!.close();

    await setup({ role: Roles.RESEARCHER });
    await request(app!.getHttpAdapter().getInstance()).patch(`/alerts/${alertId}/status`).send({ status: 'ATTENDED' }).expect(403);
  });

  it('lists alerts with filters and pagination', async () => {
    await setup({ role: Roles.FIELD_OPERATOR });

    await request(app!.getHttpAdapter().getInstance())
      .get(`/alerts?status=PENDING&severity=HIGH&cattleId=${cattleId}&page=1&pageSize=20`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(1);
        expect(body.pagination).toEqual({ page: 1, pageSize: 20, total: 1 });
      });
    expect(list).toHaveBeenCalledWith({ status: 'PENDING', severity: 'HIGH', cattleId, page: 1, pageSize: 20 });
  });

  it('returns alert detail and maps missing alerts', async () => {
    await setup({ role: Roles.RESEARCHER });
    await request(app!.getHttpAdapter().getInstance()).get(`/alerts/${alertId}`).expect(200).expect(({ body }) => {
      expect(body).toMatchObject({ success: true, data: { id: alertId, cattleId, eventId } });
    });
    await app!.close();

    await setup({ detailError: new AlertNotFoundError(alertId) });
    await request(app!.getHttpAdapter().getInstance()).get(`/alerts/${alertId}`).expect(404).expect(({ body }) => expect(body.error.code).toBe('NOT_FOUND'));
  });

  it('updates alert status and maps validation failures', async () => {
    await setup({ role: Roles.FIELD_OPERATOR });
    await request(app!.getHttpAdapter().getInstance())
      .patch(`/alerts/${alertId}/status`)
      .send({ status: 'ATTENDED', attendedAt: '2026-06-30T02:00:00.000Z' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          success: true,
          data: { id: alertId, status: 'ATTENDED', attendedAt: '2026-06-30T02:00:00.000Z' }
        });
      });
    expect(updateStatus).toHaveBeenCalledWith({ alertId, status: 'ATTENDED', attendedAt: '2026-06-30T02:00:00.000Z', userId });
    await app!.close();

    await setup({ updateError: new InvalidAlertInputError('invalid') });
    await request(app!.getHttpAdapter().getInstance()).patch(`/alerts/${alertId}/status`).send({ status: 'ATTENDED' }).expect(400).expect(({ body }) => {
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
