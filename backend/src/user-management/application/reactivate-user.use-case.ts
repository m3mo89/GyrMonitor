import type { UserRepository } from '../../authentication/application/authentication.types';
import { UserStatuses } from '../../authentication/domain/user';
import { assertUuid } from '../../shared/validation/assertions';
import { InvalidUserInputError, UserNotFoundError } from './user-management.errors';
import type { ReactivateUserCommand, UserSummaryDto } from './user-management.types';

export class ReactivateUserUseCase {
  private readonly users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  async execute(command: ReactivateUserCommand): Promise<UserSummaryDto> {
    try {
      assertUuid(command.targetUserId, 'userId');
    } catch (error) {
      throw new InvalidUserInputError(error instanceof Error ? error.message : 'userId must be a valid UUID.');
    }

    const existing = await this.users.findById(command.targetUserId);
    if (!existing) {
      throw new UserNotFoundError(command.targetUserId);
    }

    const updated = await this.users.updateStatus(command.targetUserId, UserStatuses.ACTIVE);
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
