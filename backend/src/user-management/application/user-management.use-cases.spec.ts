import { describe, expect, it, vi } from 'vitest';

import type { PasswordHasher, UserRepository } from '../../authentication/application/authentication.types';
import { Roles } from '../../authentication/domain/role';
import { UserStatuses, type User } from '../../authentication/domain/user';
import { CreateUserUseCase } from './create-user.use-case';
import { DisableUserUseCase } from './disable-user.use-case';
import { ListUsersUseCase } from './list-users.use-case';
import { ReactivateUserUseCase } from './reactivate-user.use-case';
import { ResetPasswordUseCase } from './reset-password.use-case';
import { EmailAlreadyExistsError, InvalidUserInputError, SelfDisableNotAllowedError, UserNotFoundError } from './user-management.errors';

const adminId = '11111111-1111-4111-8111-111111111111';
const targetId = '22222222-2222-4222-8222-222222222222';
const missingId = '33333333-3333-4333-8333-333333333333';

const targetUser: User = {
  id: targetId,
  name: 'Field User',
  email: 'field@gyr.test',
  role: Roles.FIELD_OPERATOR,
  status: UserStatuses.ACTIVE,
  passwordHash: 'hashed-password'
};

function repository(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    findByEmail: vi.fn(async () => null),
    findById: vi.fn(async (id: string) => (id === targetId ? targetUser : null)),
    create: vi.fn(async (input) => ({ ...input, status: UserStatuses.ACTIVE })),
    findAll: vi.fn(async () => [targetUser]),
    updateStatus: vi.fn(async (id, status) => (id === targetId ? { ...targetUser, status } : null)),
    updatePasswordHash: vi.fn(async (id, passwordHash) => (id === targetId ? { ...targetUser, passwordHash } : null)),
    ...overrides
  };
}

function passwordHasher(): PasswordHasher {
  return {
    hash: vi.fn(async (password: string) => `hashed:${password}`),
    verify: vi.fn(async () => true)
  };
}

describe('CreateUserUseCase', () => {
  it('creates a user with ACTIVE status and hashed password', async () => {
    const users = repository();
    const hasher = passwordHasher();
    const useCase = new CreateUserUseCase(users, hasher);

    const result = await useCase.execute({ name: 'New User', email: 'New@Gyr.test', role: Roles.RESEARCHER, password: 'a-strong-password' });

    expect(result).toEqual({ id: expect.any(String), name: 'New User', email: 'new@gyr.test', role: Roles.RESEARCHER, status: UserStatuses.ACTIVE });
    expect(hasher.hash).toHaveBeenCalledWith('a-strong-password');
    expect(users.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New User', email: 'new@gyr.test', role: Roles.RESEARCHER, passwordHash: 'hashed:a-strong-password' })
    );
  });

  it('rejects a duplicate email', async () => {
    const users = repository({ findByEmail: vi.fn(async () => targetUser) });
    const useCase = new CreateUserUseCase(users, passwordHasher());

    await expect(
      useCase.execute({ name: 'New User', email: targetUser.email, role: Roles.RESEARCHER, password: 'a-strong-password' })
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError);
  });

  it('rejects an invalid role', async () => {
    const useCase = new CreateUserUseCase(repository(), passwordHasher());

    await expect(
      useCase.execute({ name: 'New User', email: 'new@gyr.test', role: 'NOT_A_ROLE', password: 'a-strong-password' })
    ).rejects.toBeInstanceOf(InvalidUserInputError);
  });

  it('rejects a short password', async () => {
    const useCase = new CreateUserUseCase(repository(), passwordHasher());

    await expect(
      useCase.execute({ name: 'New User', email: 'new@gyr.test', role: Roles.RESEARCHER, password: 'short' })
    ).rejects.toBeInstanceOf(InvalidUserInputError);
  });
});

describe('ListUsersUseCase', () => {
  it('returns every user without password material', async () => {
    const useCase = new ListUsersUseCase(repository());

    await expect(useCase.execute()).resolves.toEqual([
      { id: targetId, name: targetUser.name, email: targetUser.email, role: targetUser.role, status: UserStatuses.ACTIVE }
    ]);
  });
});

describe('DisableUserUseCase', () => {
  it('disables another user', async () => {
    const useCase = new DisableUserUseCase(repository());

    await expect(useCase.execute({ targetUserId: targetId, actingUserId: adminId })).resolves.toMatchObject({
      id: targetId,
      status: UserStatuses.DISABLED
    });
  });

  it('rejects disabling your own account', async () => {
    const useCase = new DisableUserUseCase(repository());

    await expect(useCase.execute({ targetUserId: adminId, actingUserId: adminId })).rejects.toBeInstanceOf(SelfDisableNotAllowedError);
  });

  it('rejects a missing user', async () => {
    const useCase = new DisableUserUseCase(repository());

    await expect(useCase.execute({ targetUserId: missingId, actingUserId: adminId })).rejects.toBeInstanceOf(UserNotFoundError);
  });
});

describe('ReactivateUserUseCase', () => {
  it('reactivates a disabled user', async () => {
    const useCase = new ReactivateUserUseCase(repository());

    await expect(useCase.execute({ targetUserId: targetId })).resolves.toMatchObject({ id: targetId, status: UserStatuses.ACTIVE });
  });

  it('rejects a missing user', async () => {
    const useCase = new ReactivateUserUseCase(repository());

    await expect(useCase.execute({ targetUserId: missingId })).rejects.toBeInstanceOf(UserNotFoundError);
  });
});

describe('ResetPasswordUseCase', () => {
  it('hashes and stores a new password', async () => {
    const users = repository();
    const hasher = passwordHasher();
    const useCase = new ResetPasswordUseCase(users, hasher);

    await expect(useCase.execute({ targetUserId: targetId, newPassword: 'a-new-strong-password' })).resolves.toMatchObject({ id: targetId });
    expect(hasher.hash).toHaveBeenCalledWith('a-new-strong-password');
    expect(users.updatePasswordHash).toHaveBeenCalledWith(targetId, 'hashed:a-new-strong-password');
  });

  it('rejects a short password', async () => {
    const useCase = new ResetPasswordUseCase(repository(), passwordHasher());

    await expect(useCase.execute({ targetUserId: targetId, newPassword: 'short' })).rejects.toBeInstanceOf(InvalidUserInputError);
  });

  it('rejects a missing user', async () => {
    const useCase = new ResetPasswordUseCase(repository(), passwordHasher());

    await expect(useCase.execute({ targetUserId: missingId, newPassword: 'a-new-strong-password' })).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
