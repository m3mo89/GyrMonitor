import type { DatabaseConfig } from '../config/app.config';
import { DatabaseConfigurationError, DatabaseConnectionError } from './database.errors';
import type { DatabaseClient, DatabaseRows } from './database.types';

type MysqlPool = {
  query(sql: string, params?: unknown[]): Promise<[unknown[], unknown]>;
  execute(sql: string, params?: unknown[]): Promise<[unknown[], unknown]>;
  end(): Promise<void>;
};

type Mysql2PromiseModule = {
  createPool(config: Record<string, unknown>): MysqlPool;
};

export function createMariaDbClient(config: DatabaseConfig): DatabaseClient {
  assertDatabaseConfig(config);

  let pool: MysqlPool;
  try {
    pool = loadMysql2().createPool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      connectionLimit: config.connectionLimit,
      decimalNumbers: true,
      dateStrings: true,
      timezone: 'Z'
    });
  } catch (error) {
    throw new DatabaseConnectionError(`Unable to initialize MariaDB driver: ${errorMessage(error)}`);
  }

  return {
    async query<T>(sql: string, params: unknown[] = []): Promise<DatabaseRows<T>> {
      try {
        const [rows] = await pool.query(sql, params);
        return rows as DatabaseRows<T>;
      } catch (error) {
        throw normalizeDatabaseError(error);
      }
    },
    async execute<T>(sql: string, params: unknown[] = []): Promise<DatabaseRows<T>> {
      try {
        const [rows] = await pool.execute(sql, params);
        return rows as DatabaseRows<T>;
      } catch (error) {
        throw normalizeDatabaseError(error);
      }
    },
    async close(): Promise<void> {
      await pool.end();
    }
  };
}

export function createConfiguredMariaDbClient(): DatabaseClient {
  const { appConfig } = require('../config/app.config') as typeof import('../config/app.config');
  return createMariaDbClient(appConfig.database);
}

export function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY';
}

function assertDatabaseConfig(config: DatabaseConfig): void {
  const missing = [
    ['DB_HOST', config.host],
    ['DB_PORT', String(config.port)],
    ['DB_NAME', config.database],
    ['DB_USER', config.user],
    ['DB_PASSWORD', config.password]
  ].filter(([, value]) => value.trim().length === 0);

  if (missing.length > 0 || !Number.isInteger(config.port) || config.port < 1) {
    throw new DatabaseConfigurationError(
      `Missing or invalid MariaDB configuration: ${missing.map(([name]) => name).join(', ') || 'DB_PORT'}`
    );
  }
}

function loadMysql2(): Mysql2PromiseModule {
  try {
    return require('mysql2/promise') as Mysql2PromiseModule;
  } catch (error) {
    throw new DatabaseConnectionError(
      `MariaDB driver dependency is not installed. Run npm install before database commands. ${errorMessage(error)}`
    );
  }
}

function normalizeDatabaseError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new DatabaseConnectionError(`Unexpected MariaDB error: ${String(error)}`);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
