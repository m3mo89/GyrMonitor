export type BackendConfig = {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  passwordHashIterations: number;
  idempotencyTtlHours: number;
  syncBatchSize: number;
  logLevel: string;
};

export const appConfig: BackendConfig = {
  nodeEnv: 'development',
  port: 3000,
  apiPrefix: '/api/v1',
  databaseUrl: 'mysql://gyrmonitor:change-me@localhost:3306/gyrmonitor',
  jwtSecret: 'change-me',
  jwtExpiresIn: '3600s',
  passwordHashIterations: 100000,
  idempotencyTtlHours: 24,
  syncBatchSize: 100,
  logLevel: 'info'
};
