import { describe, expect, it, vi } from 'vitest';

import { Roles } from '../../authentication/domain/role';
import type { PasswordHasher, TokenService, UserRepository } from './authentication.types';
import { InvalidCredentialsError, ValidationError } from './authentication.errors';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase', () => {
  const user = {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@gyr.test',
    role: Roles.ADMIN,
    passwordHash: 'hashed-password'
  };

  function setup(options: { passwordMatches?: boolean; userExists?: boolean } = {}) {
    const users: UserRepository = {
      findByEmail: vi.fn(async () => (options.userExists === false ? null : user))
    };
    const passwordHasher: PasswordHasher = {
      hash: vi.fn(),
      verify: vi.fn(async () => options.passwordMatches !== false)
    };
    const tokenService: TokenService = {
      sign: vi.fn(async () => ({ accessToken: 'signed-token', expiresIn: 3600 })),
      verify: vi.fn()
    };

    return {
      users,
      passwordHasher,
      tokenService,
      useCase: new LoginUseCase(users, passwordHasher, tokenService)
    };
  }

  it('returns a token and authenticated user for valid credentials', async () => {
    const { useCase, tokenService } = setup();

    await expect(useCase.execute({ email: 'ADMIN@GYR.TEST ', password: 'secret' })).resolves.toEqual({
      accessToken: 'signed-token',
      expiresIn: 3600,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    expect(tokenService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email, role: user.role });
  });

  it('normalizes email before lookup', async () => {
    const { users, useCase } = setup();

    await useCase.execute({ email: ' ADMIN@GYR.TEST ', password: 'secret' });

    expect(users.findByEmail).toHaveBeenCalledWith('admin@gyr.test');
  });

  it('rejects missing credentials', async () => {
    const { useCase } = setup();

    await expect(useCase.execute({ email: '', password: 'secret' })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ email: 'admin@gyr.test', password: '' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects invalid credentials', async () => {
    await expect(setup({ passwordMatches: false }).useCase.execute({ email: user.email, password: 'bad' })).rejects.toBeInstanceOf(
      InvalidCredentialsError
    );
    await expect(setup({ userExists: false }).useCase.execute({ email: user.email, password: 'secret' })).rejects.toBeInstanceOf(
      InvalidCredentialsError
    );
  });
});
