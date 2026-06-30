import type { UserRepository } from '../application/authentication.types';
import { isRole } from '../domain/role';
import type { User } from '../domain/user';
import { getSharedDatabaseClient } from '../../database/database-singleton';
import type { DatabaseClient } from '../../database/database.types';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  password_hash: string;
};

export class MariaDbUserRepository implements UserRepository {
  private readonly client: DatabaseClient;

  constructor(client: DatabaseClient = getSharedDatabaseClient()) {
    this.client = client;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.client.execute<UserRow>(
      `SELECT id, name, email, role, password_hash
       FROM users
       WHERE normalized_email = ?
       LIMIT 1`,
      [email.toLowerCase()]
    );

    const row = rows[0];
    if (!row || !isRole(row.role)) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      passwordHash: row.password_hash
    };
  }
}
