import { Roles } from '../domain/role';
import { UserStatuses } from '../domain/user';
import type { User, UserStatus } from '../domain/user';
import type { CreateUserInput, PasswordHasher, UserRepository } from '../application/authentication.types';

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
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Operador de Campo',
    email: 'field@gyrmonitor.local',
    role: Roles.FIELD_OPERATOR,
    password: 'local-field-password'
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

  async findById(id: string): Promise<User | null> {
    const users = await this.loadUsers();
    return users.find((user) => user.id === id) ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const users = await this.loadUsers();
    const created: User = { ...input, status: UserStatuses.ACTIVE };
    users.push(created);
    return created;
  }

  async findAll(): Promise<User[]> {
    return this.loadUsers();
  }

  async updateStatus(id: string, status: UserStatus): Promise<User | null> {
    const users = await this.loadUsers();
    const user = users.find((candidate) => candidate.id === id);
    if (!user) {
      return null;
    }

    user.status = status;
    return user;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<User | null> {
    const users = await this.loadUsers();
    const user = users.find((candidate) => candidate.id === id);
    if (!user) {
      return null;
    }

    user.passwordHash = passwordHash;
    return user;
  }

  private async loadUsers(): Promise<User[]> {
    if (!this.users) {
      this.users = await Promise.all(
        localAuthUsers.map(async (user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: UserStatuses.ACTIVE,
          passwordHash: await this.passwordHasher.hash(user.password)
        }))
      );
    }

    return this.users;
  }
}
