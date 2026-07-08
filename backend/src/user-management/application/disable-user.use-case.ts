import type { UserRepository } from '../../authentication/application/authentication.types';
import { UserStatuses } from '../../authentication/domain/user';
import { assertUuid } from '../../shared/validation/assertions';
import { InvalidUserInputError, SelfDisableNotAllowedError, UserNotFoundError } from './user-management.errors';
import type { DisableUserCommand, UserSummaryDto } from './user-management.types';

export class DisableUserUseCase {
  private readonly users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  async execute(command: DisableUserCommand): Promise<UserSummaryDto> {
    try {
      assertUuid(command.targetUserId, 'userId');
    } catch (error) {
      throw new InvalidUserInputError(error instanceof Error ? error.message : 'userId must be a valid UUID.');
    }

    if (command.targetUserId === command.actingUserId) {
      throw new SelfDisableNotAllowedError();
    }

    const existing = await this.users.findById(command.targetUserId);
    if (!existing) {
      throw new UserNotFoundError(command.targetUserId);
    }

    const updated = await this.users.updateStatus(command.targetUserId, UserStatuses.DISABLED);
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
