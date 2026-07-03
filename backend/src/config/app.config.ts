export type BackendConfig = {
  nodeEnv: string;
  port: number;
  host: string;
  apiPrefix: string;
  databaseUrl: string;
  database: DatabaseConfig;
  jwtSecret: string;
  jwtExpiresIn: string;
  passwordHashIterations: number;
  idempotencyTtlHours: number;
  syncBatchSize: number;
  logLevel: string;
  swaggerEnabled: boolean;
};

export type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  connectionLimit: number;
};

function readNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
}

function readDatabaseConfig(): DatabaseConfig {
  const url = parseDatabaseUrl(process.env.DATABASE_URL);

  return {
    host: process.env.DB_HOST ?? url?.host ?? 'localhost',
    port: readNumber(process.env.DB_PORT, url?.port ?? 3306),
    database: process.env.DB_NAME ?? url?.database ?? 'gyrmonitor',
    user: process.env.DB_USER ?? url?.user ?? 'gyrmonitor',
    password: process.env.DB_PASSWORD ?? url?.password ?? 'change-me',
    connectionLimit: readNumber(process.env.DB_CONNECTION_LIMIT, 10)
  };
}

function parseDatabaseUrl(value: string | undefined): Partial<DatabaseConfig> | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      database: url.pathname.replace(/^\//, ''),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password)
    };
  } catch {
    return null;
  }
}

export const appConfig: BackendConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: readNumber(process.env.BACKEND_PORT ?? process.env.PORT, 3000),
  host: process.env.BACKEND_HOST ?? process.env.HOST ?? '127.0.0.1',
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  databaseUrl: process.env.DATABASE_URL ?? 'mysql://gyrmonitor:change-me@localhost:3306/gyrmonitor',
  database: readDatabaseConfig(),
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '3600s',
  passwordHashIterations: readNumber(process.env.PASSWORD_HASH_ITERATIONS, 100000),
  idempotencyTtlHours: readNumber(process.env.IDEMPOTENCY_TTL_HOURS, 24),
  syncBatchSize: readNumber(process.env.SYNC_BATCH_SIZE, 100),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  swaggerEnabled: readBoolean(process.env.SWAGGER_ENABLED, process.env.NODE_ENV !== 'production')
};
