export type DatabaseRows<T> = T[];

export type DatabaseClient = {
  query<T>(sql: string, params?: unknown[]): Promise<DatabaseRows<T>>;
  execute<T>(sql: string, params?: unknown[]): Promise<DatabaseRows<T>>;
  close(): Promise<void>;
};

export type DatabaseMigration = {
  version: string;
  name: string;
  sql: string;
};
