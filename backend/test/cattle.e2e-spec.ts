import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Roles, type Role } from '../src/authentication/domain/role';
import { CattleNotFoundError, InvalidCattleIdError } from '../src/cattle-monitoring/application/cattle.errors';
import { GetCattleDetailUseCase } from '../src/cattle-monitoring/application/get-cattle-detail.use-case';
import { GetCattleHistoryUseCase } from '../src/cattle-monitoring/application/get-cattle-history.use-case';
import { ListCattleUseCase } from '../src/cattle-monitoring/application/list-cattle.use-case';
import { CattleSex, CattleStatus } from '../src/cattle-monitoring/domain/cattle';
import { CattleController } from '../src/cattle-monitoring/http/cattle.controller';
import { createHttpTestApp } from './http-test-app';

const cattleId = '11111111-1111-4111-8111-111111111111';

describe('CattleController e2e', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  async function setup(options: { role?: string; authMode?: 'unauthenticated' | 'authenticated'; detailError?: Error; historyError?: Error } = {}) {
    app = await createHttpTestApp({
      controllers: [CattleController],
      authMode: options.authMode,
      user: { sub: 'user-1', role: (options.role ?? Roles.ADMIN) as Role },
      providers: [
        {
          provide: ListCattleUseCase,
          useValue: {
            execute: vi.fn(async () => ({
              data: [{ id: cattleId, tagNumber: 'GYR-001', breed: 'Gyr', sex: CattleSex.FEMALE, status: CattleStatus.ACTIVE }],
              pagination: { page: 1, pageSize: 20, total: 1 }
            }))
          }
        },
        {
          provide: GetCattleDetailUseCase,
          useValue: {
            execute: vi.fn(async () => {
              if (options.detailError) throw options.detailError;
              return { id: cattleId, tagNumber: 'GYR-001', breed: 'Gyr', sex: CattleSex.FEMALE, status: CattleStatus.ACTIVE, createdAt: '2026-06-30T00:00:00.000Z' };
            })
          }
        },
        {
          provide: GetCattleHistoryUseCase,
          useValue: {
            execute: vi.fn(async () => {
              if (options.historyError) throw options.historyError;
              return { cattleId, events: [], pagination: { page: 1, pageSize: 20, total: 0 } };
            })
          }
        }
      ]
    });
  }

  it('rejects unauthenticated access', async () => {
    await setup({ authMode: 'unauthenticated' });

    await request(app!.getHttpAdapter().getInstance()).get('/cattle').expect(401);
  });

  it('rejects forbidden roles', async () => {
    await setup({ role: Roles.FIELD_OPERATOR });

    await request(app!.getHttpAdapter().getInstance()).get('/cattle').expect(403);
  });

  it('returns list success envelopes with pagination', async () => {
    await setup();

    await request(app!.getHttpAdapter().getInstance())
      .get('/cattle?page=1&pageSize=20')
      .expect(200)
      .expect(({ body }) => {
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(1);
        expect(body.pagination).toEqual({ page: 1, pageSize: 20, total: 1 });
      });
  });

  it('returns detail success and not-found envelopes', async () => {
    await setup();
    await request(app!.getHttpAdapter().getInstance()).get(`/cattle/${cattleId}`).expect(200).expect(({ body }) => expect(body.success).toBe(true));
    await app!.close();

    await setup({ detailError: new CattleNotFoundError() });
    await request(app!.getHttpAdapter().getInstance()).get(`/cattle/${cattleId}`).expect(404).expect(({ body }) => {
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  it('returns history success and validation envelopes', async () => {
    await setup();
    await request(app!.getHttpAdapter().getInstance()).get(`/cattle/${cattleId}/events`).expect(200).expect(({ body }) => {
      expect(body).toMatchObject({ success: true, data: { cattleId, events: [], pagination: { page: 1, pageSize: 20, total: 0 } } });
    });
    await app!.close();

    await setup({ historyError: new InvalidCattleIdError() });
    await request(app!.getHttpAdapter().getInstance()).get(`/cattle/bad-id/events`).expect(400).expect(({ body }) => {
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
