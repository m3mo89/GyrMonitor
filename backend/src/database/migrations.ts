import { readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

import type { DatabaseClient, DatabaseMigration } from './database.types';

type MigrationRow = {
  version: string;
};

const migrationTableSql = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

export async function runMigrations(client: DatabaseClient, migrations = readMigrations()): Promise<string[]> {
  await client.query(migrationTableSql);

  const appliedRows = await client.query<MigrationRow>('SELECT version FROM schema_migrations');
  const applied = new Set(appliedRows.map((row) => row.version));
  const appliedNow: string[] = [];

  for (const migration of migrations) {
    if (applied.has(migration.version)) {
      continue;
    }

    await runMigrationSql(client, migration.sql);
    await client.execute('INSERT INTO schema_migrations (version, name) VALUES (?, ?)', [migration.version, migration.name]);
    appliedNow.push(migration.version);
  }

  return appliedNow;
}

export function readMigrations(directory = defaultMigrationsDirectory()): DatabaseMigration[] {
  return readdirSync(directory)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => {
      const [version, ...nameParts] = basename(file, '.sql').split('_');

      return {
        version,
        name: nameParts.join('_'),
        sql: readFileSync(join(directory, file), 'utf8')
      };
    });
}

function defaultMigrationsDirectory(): string {
  return resolve(process.cwd(), 'src/database/migrations');
}

async function runMigrationSql(client: DatabaseClient, sql: string): Promise<void> {
  for (const statement of splitSqlStatements(sql)) {
    await client.query(statement);
  }
}

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0 && !statement.startsWith('--'));
}
