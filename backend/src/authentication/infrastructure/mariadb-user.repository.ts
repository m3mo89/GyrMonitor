import type { CreateUserInput, UserRepository } from '../application/authentication.types';
import { isRole } from '../domain/role';
import type { User, UserStatus } from '../domain/user';
import { isUserStatus } from '../domain/user';
import { getSharedDatabaseClient } from '../../database/database-singleton';
import type { DatabaseClient } from '../../database/database.types';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  password_hash: string;
};

export class MariaDbUserRepository implements UserRepository {
  private readonly client: DatabaseClient;

  constructor(client: DatabaseClient = getSharedDatabaseClient()) {
    this.client = client;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.client.execute<UserRow>(
      `SELECT id, name, email, role, status, password_hash
       FROM users
       WHERE normalized_email = ?
       LIMIT 1`,
      [email.toLowerCase()]
    );

    return toUser(rows[0]);
  }

  async findById(id: string): Promise<User | null> {
    const rows = await this.client.execute<UserRow>(
      `SELECT id, name, email, role, status, password_hash
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return toUser(rows[0]);
  }

  async create(input: CreateUserInput): Promise<User> {
    await this.client.execute(
      `INSERT INTO users (id, name, email, normalized_email, role, status, password_hash)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)`,
      [input.id, input.name, input.email, input.email.toLowerCase(), input.role, input.passwordHash]
    );

    const created = await this.findById(input.id);
    if (!created) {
      throw new Error('Failed to load user immediately after creation.');
    }

    return created;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.client.execute<UserRow>(
      `SELECT id, name, email, role, status, password_hash
       FROM users
       ORDER BY name ASC`
    );

    return rows.map(toUser).filter((user): user is User => user !== null);
  }

  async updateStatus(id: string, status: UserStatus): Promise<User | null> {
    await this.client.execute(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);
    return this.findById(id);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<User | null> {
    await this.client.execute(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, id]);
    return this.findById(id);
  }
}

function toUser(row: UserRow | undefined): User | null {
  if (!row || !isRole(row.role) || !isUserStatus(row.status)) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    passwordHash: row.password_hash
  };
}
