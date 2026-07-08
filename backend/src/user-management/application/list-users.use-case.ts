import type { UserRepository } from '../../authentication/application/authentication.types';
import type { UserSummaryDto } from './user-management.types';

export class ListUsersUseCase {
  private readonly users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  async execute(): Promise<UserSummaryDto[]> {
    const users = await this.users.findAll();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }));
  }
}
