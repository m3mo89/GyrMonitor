import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Roles, type Role } from '../src/authentication/domain/role';
import { InvalidDashboardQueryError } from '../src/dashboard/application/dashboard.errors';
import { GetDashboardMetricsUseCase } from '../src/dashboard/application/get-dashboard-metrics.use-case';
import { DashboardController } from '../src/dashboard/http/dashboard.controller';
import { createHttpTestApp } from './http-test-app';

describe('DashboardController e2e', () => {
  let app: INestApplication | undefined;
  let execute: ReturnType<typeof vi.fn>;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  async function setup(options: { role?: Role; authMode?: 'unauthenticated' | 'authenticated'; error?: Error } = {}) {
    execute = vi.fn(async () => {
      if (options.error) throw options.error;
      return {
        totalCattle: 2,
        activeAlerts: 1,
        averageRiskScore: 60,
        highRiskCattle: 1,
        eventsToday: 1,
        syncPendingCount: 0,
        riskRanking: [{ cattleId: '11111111-1111-4111-8111-111111111111', tagNumber: 'GYR-001', riskScore: 90 }],
        trend: [{ date: '2026-06-30', events: 1, alerts: 1 }]
      };
    });

    app = await createHttpTestApp({
      controllers: [DashboardController],
      authMode: options.authMode,
      user: { sub: 'user-1', role: options.role ?? Roles.ADMIN },
      providers: [{ provide: GetDashboardMetricsUseCase, useValue: { execute } }]
    });
  }

  it('rejects unauthenticated and forbidden access', async () => {
    await setup({ authMode: 'unauthenticated' });
    await request(app!.getHttpAdapter().getInstance()).get('/dashboard').expect(401);
    await app!.close();

    await setup({ role: Roles.FIELD_OPERATOR });
    await request(app!.getHttpAdapter().getInstance()).get('/dashboard').expect(403);
  });

  it('returns dashboard metrics for authorized users and passes filters', async () => {
    await setup({ role: Roles.RESEARCHER });

    await request(app!.getHttpAdapter().getInstance())
      .get('/dashboard?from=2026-06-29T00:00:00.000Z&to=2026-06-30T23:59:59.000Z')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ success: true, data: { totalCattle: 2, activeAlerts: 1 } });
      });
    expect(execute).toHaveBeenCalledWith({
      from: '2026-06-29T00:00:00.000Z',
      to: '2026-06-30T23:59:59.000Z',
      corralId: undefined
    });
  });

  it('maps validation failures to standard error envelope', async () => {
    await setup({ error: new InvalidDashboardQueryError('invalid from') });

    await request(app!.getHttpAdapter().getInstance())
      .get('/dashboard?from=bad-date')
      .expect(400)
      .expect(({ body }) => {
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('VALIDATION_ERROR');
      });
  });
});
