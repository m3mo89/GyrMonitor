import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Roles, type Role } from '../src/authentication/domain/role';
import { UserStatuses } from '../src/authentication/domain/user';
import { CreateUserUseCase } from '../src/user-management/application/create-user.use-case';
import { DisableUserUseCase } from '../src/user-management/application/disable-user.use-case';
import { ListUsersUseCase } from '../src/user-management/application/list-users.use-case';
import { ReactivateUserUseCase } from '../src/user-management/application/reactivate-user.use-case';
import { ResetPasswordUseCase } from '../src/user-management/application/reset-password.use-case';
import { EmailAlreadyExistsError, SelfDisableNotAllowedError } from '../src/user-management/application/user-management.errors';
import { UserManagementController } from '../src/user-management/http/user-management.controller';
import { createHttpTestApp } from './http-test-app';

const targetId = '22222222-2222-4222-8222-222222222222';
const summary = { id: targetId, name: 'Field User', email: 'field@gyr.test', role: Roles.FIELD_OPERATOR, status: UserStatuses.ACTIVE };

describe('UserManagementController e2e', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  async function setup(options: {
    role?: string;
    authMode?: 'unauthenticated' | 'authenticated';
    createExecute?: ReturnType<typeof vi.fn>;
    listExecute?: ReturnType<typeof vi.fn>;
    disableExecute?: ReturnType<typeof vi.fn>;
    reactivateExecute?: ReturnType<typeof vi.fn>;
    resetPasswordExecute?: ReturnType<typeof vi.fn>;
  } = {}) {
    app = await createHttpTestApp({
      controllers: [UserManagementController],
      authMode: options.authMode,
      user: { sub: '11111111-1111-4111-8111-111111111111', role: (options.role ?? Roles.ADMIN) as Role },
      providers: [
        { provide: CreateUserUseCase, useValue: { execute: options.createExecute ?? vi.fn(async () => summary) } },
        { provide: ListUsersUseCase, useValue: { execute: options.listExecute ?? vi.fn(async () => [summary]) } },
        { provide: DisableUserUseCase, useValue: { execute: options.disableExecute ?? vi.fn(async () => ({ ...summary, status: UserStatuses.DISABLED })) } },
        { provide: ReactivateUserUseCase, useValue: { execute: options.reactivateExecute ?? vi.fn(async () => summary) } },
        { provide: ResetPasswordUseCase, useValue: { execute: options.resetPasswordExecute ?? vi.fn(async () => summary) } }
      ]
    });
  }

  it('rejects unauthenticated access', async () => {
    await setup({ authMode: 'unauthenticated' });

    await request(app!.getHttpAdapter().getInstance()).get('/users').expect(401);
  });

  it('rejects non-admin roles', async () => {
    await setup({ role: Roles.RESEARCHER });

    await request(app!.getHttpAdapter().getInstance()).get('/users').expect(403);
    await request(app!.getHttpAdapter().getInstance()).post('/users').send({}).expect(403);
    await request(app!.getHttpAdapter().getInstance()).post(`/users/${targetId}/disable`).expect(403);
    await request(app!.getHttpAdapter().getInstance()).post(`/users/${targetId}/reactivate`).expect(403);
    await request(app!.getHttpAdapter().getInstance()).post(`/users/${targetId}/reset-password`).send({}).expect(403);
  });

  it('creates a user for an admin', async () => {
    const execute = vi.fn(async () => summary);
    await setup({ createExecute: execute });

    await request(app!.getHttpAdapter().getInstance())
      .post('/users')
      .send({ name: 'Field User', email: 'field@gyr.test', role: Roles.FIELD_OPERATOR, password: 'a-strong-password' })
      .expect(201)
      .expect(({ body }) => expect(body).toEqual({ success: true, data: summary }));
    expect(execute).toHaveBeenCalledWith({ name: 'Field User', email: 'field@gyr.test', role: Roles.FIELD_OPERATOR, password: 'a-strong-password' });
  });

  it('maps a duplicate email to a 400 validation envelope', async () => {
    await setup({ createExecute: vi.fn(async () => { throw new EmailAlreadyExistsError('field@gyr.test'); }) });

    await request(app!.getHttpAdapter().getInstance())
      .post('/users')
      .send({ name: 'Field User', email: 'field@gyr.test', role: Roles.FIELD_OPERATOR, password: 'a-strong-password' })
      .expect(400)
      .expect(({ body }) => expect(body.error.code).toBe('VALIDATION_ERROR'));
  });

  it('lists users for an admin', async () => {
    await setup();

    await request(app!.getHttpAdapter().getInstance())
      .get('/users')
      .expect(200)
      .expect(({ body }) => expect(body).toEqual({ success: true, data: [summary] }));
  });

  it('disables a user', async () => {
    const execute = vi.fn(async () => ({ ...summary, status: UserStatuses.DISABLED }));
    await setup({ disableExecute: execute });

    await request(app!.getHttpAdapter().getInstance())
      .post(`/users/${targetId}/disable`)
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe(UserStatuses.DISABLED));
    expect(execute).toHaveBeenCalledWith({ targetUserId: targetId, actingUserId: '11111111-1111-4111-8111-111111111111' });
  });

  it('maps self-disable to a 400 validation envelope', async () => {
    await setup({ disableExecute: vi.fn(async () => { throw new SelfDisableNotAllowedError(); }) });

    await request(app!.getHttpAdapter().getInstance())
      .post(`/users/${targetId}/disable`)
      .expect(400)
      .expect(({ body }) => expect(body.error.code).toBe('VALIDATION_ERROR'));
  });

  it('reactivates a user', async () => {
    await setup();

    await request(app!.getHttpAdapter().getInstance())
      .post(`/users/${targetId}/reactivate`)
      .expect(201)
      .expect(({ body }) => expect(body).toEqual({ success: true, data: summary }));
  });

  it('resets a password', async () => {
    const execute = vi.fn(async () => summary);
    await setup({ resetPasswordExecute: execute });

    await request(app!.getHttpAdapter().getInstance())
      .post(`/users/${targetId}/reset-password`)
      .send({ newPassword: 'a-new-strong-password' })
      .expect(201)
      .expect(({ body }) => expect(body).toEqual({ success: true, data: summary }));
    expect(execute).toHaveBeenCalledWith({ targetUserId: targetId, newPassword: 'a-new-strong-password' });
  });
});
