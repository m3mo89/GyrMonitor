import { randomUUID } from 'node:crypto';

import type { PasswordHasher, UserRepository } from '../../authentication/application/authentication.types';
import { isRole } from '../../authentication/domain/role';
import { EmailAlreadyExistsError, InvalidUserInputError } from './user-management.errors';
import type { CreateUserCommand, UserSummaryDto } from './user-management.types';

const minimumPasswordLength = 8;

export class CreateUserUseCase {
  private readonly users: UserRepository;
  private readonly passwordHasher: PasswordHasher;

  constructor(users: UserRepository, passwordHasher: PasswordHasher) {
    this.users = users;
    this.passwordHasher = passwordHasher;
  }

  async execute(command: CreateUserCommand): Promise<UserSummaryDto> {
    const name = command.name?.trim();
    const email = command.email?.trim().toLowerCase();
    const role = command.role;
    const password = command.password;

    if (!name) {
      throw new InvalidUserInputError('Name is required.');
    }

    if (!email) {
      throw new InvalidUserInputError('Email is required.');
    }

    if (!role || !isRole(role)) {
      throw new InvalidUserInputError('Role must be one of the approved roles.');
    }

    if (!password || password.length < minimumPasswordLength) {
      throw new InvalidUserInputError(`Password must be at least ${minimumPasswordLength} characters.`);
    }

    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new EmailAlreadyExistsError(email);
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const created = await this.users.create({
      id: randomUUID(),
      name,
      email,
      role,
      passwordHash
    });

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      status: created.status
    };
  }
}
