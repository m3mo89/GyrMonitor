export type BackendConfig = {
  nodeEnv: string;
  port: number;
  host: string;
  apiPrefix: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  passwordHashIterations: number;
  idempotencyTtlHours: number;
  syncBatchSize: number;
  logLevel: string;
};

function readNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const appConfig: BackendConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: readNumber(process.env.BACKEND_PORT ?? process.env.PORT, 3000),
  host: process.env.BACKEND_HOST ?? process.env.HOST ?? '127.0.0.1',
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  databaseUrl: process.env.DATABASE_URL ?? 'mysql://gyrmonitor:change-me@localhost:3306/gyrmonitor',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '3600s',
  passwordHashIterations: readNumber(process.env.PASSWORD_HASH_ITERATIONS, 100000),
  idempotencyTtlHours: readNumber(process.env.IDEMPOTENCY_TTL_HOURS, 24),
  syncBatchSize: readNumber(process.env.SYNC_BATCH_SIZE, 100),
  logLevel: process.env.LOG_LEVEL ?? 'info'
};
