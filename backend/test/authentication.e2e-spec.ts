import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InvalidCredentialsError, ValidationError } from '../src/authentication/application/authentication.errors';
import { LoginUseCase } from '../src/authentication/application/login.use-case';
import { Roles } from '../src/authentication/domain/role';
import { AuthenticationController } from '../src/authentication/http/authentication.controller';
import { createHttpTestApp } from './http-test-app';

describe('AuthenticationController e2e', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  async function setup(execute = vi.fn()) {
    app = await createHttpTestApp({
      controllers: [AuthenticationController],
      providers: [{ provide: LoginUseCase, useValue: { execute } }]
    });
    return execute;
  }

  it('returns a success envelope for valid login', async () => {
    const execute = await setup(
      vi.fn(async () => ({
        accessToken: 'token',
        expiresIn: 3600,
        user: { id: 'user-1', name: 'Admin User', email: 'admin@gyr.test', role: Roles.ADMIN }
      }))
    );

    await request(app!.getHttpAdapter().getInstance())
      .post('/auth/login')
      .send({ email: 'admin@gyr.test', password: 'secret' })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          success: true,
          data: {
            accessToken: 'token',
            expiresIn: 3600,
            user: { id: 'user-1', name: 'Admin User', email: 'admin@gyr.test', role: Roles.ADMIN }
          }
        });
      });
    expect(execute).toHaveBeenCalledWith({ email: 'admin@gyr.test', password: 'secret' });
  });

  it('maps validation failures to 400 error envelopes', async () => {
    await setup(vi.fn(async () => { throw new ValidationError('bad'); }));

    await request(app!.getHttpAdapter().getInstance())
      .post('/auth/login')
      .send({})
      .expect(400)
      .expect(({ body }) => {
        expect(body).toEqual({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' }
        });
      });
  });

  it('maps invalid credentials to 401 error envelopes', async () => {
    await setup(vi.fn(async () => { throw new InvalidCredentialsError(); }));

    await request(app!.getHttpAdapter().getInstance())
      .post('/auth/login')
      .send({ email: 'admin@gyr.test', password: 'bad' })
      .expect(401)
      .expect(({ body }) => {
        expect(body).toEqual({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid credentials.' }
        });
      });
  });
});
