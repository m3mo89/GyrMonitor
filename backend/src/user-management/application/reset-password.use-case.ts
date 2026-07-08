import type { PasswordHasher, UserRepository } from '../../authentication/application/authentication.types';
import { assertUuid } from '../../shared/validation/assertions';
import { InvalidUserInputError, UserNotFoundError } from './user-management.errors';
import type { ResetPasswordCommand, UserSummaryDto } from './user-management.types';

const minimumPasswordLength = 8;

export class ResetPasswordUseCase {
  private readonly users: UserRepository;
  private readonly passwordHasher: PasswordHasher;

  constructor(users: UserRepository, passwordHasher: PasswordHasher) {
    this.users = users;
    this.passwordHasher = passwordHasher;
  }

  async execute(command: ResetPasswordCommand): Promise<UserSummaryDto> {
    try {
      assertUuid(command.targetUserId, 'userId');
    } catch (error) {
      throw new InvalidUserInputError(error instanceof Error ? error.message : 'userId must be a valid UUID.');
    }

    if (!command.newPassword || command.newPassword.length < minimumPasswordLength) {
      throw new InvalidUserInputError(`Password must be at least ${minimumPasswordLength} characters.`);
    }

    const existing = await this.users.findById(command.targetUserId);
    if (!existing) {
      throw new UserNotFoundError(command.targetUserId);
    }

    const passwordHash = await this.passwordHasher.hash(command.newPassword);
    const updated = await this.users.updatePasswordHash(command.targetUserId, passwordHash);
    if (!updated) {
      throw new UserNotFoundError(command.targetUserId);
    }

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      status: updated.status
    };
  }
}
