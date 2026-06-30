import { Roles } from '../domain/role';
import type { User } from '../domain/user';
import type { PasswordHasher, UserRepository } from '../application/authentication.types';

export const localAuthUsers = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Administrador',
    email: 'admin@gyrmonitor.local',
    role: Roles.ADMIN,
    password: 'local-admin-password'
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Investigador',
    email: 'researcher@gyrmonitor.local',
    role: Roles.RESEARCHER,
    password: 'local-researcher-password'
  }
] as const;

export class LocalUserRepository implements UserRepository {
  private users: User[] | null = null;
  private readonly passwordHasher: PasswordHasher;

  constructor(passwordHasher: PasswordHasher) {
    this.passwordHasher = passwordHasher;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.loadUsers();
    return users.find((user) => user.email === email.toLowerCase()) ?? null;
  }

  private async loadUsers(): Promise<User[]> {
    if (!this.users) {
      this.users = await Promise.all(
        localAuthUsers.map(async (user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          passwordHash: await this.passwordHasher.hash(user.password)
        }))
      );
    }

    return this.users;
  }
}
