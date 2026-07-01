import { createHash } from 'node:crypto';

export const SyncEndpoints = {
  EVENTS: 'events',
  OBSERVATIONS: 'observations'
} as const;

export type SyncEndpoint = (typeof SyncEndpoints)[keyof typeof SyncEndpoints];

export const SyncItemStatuses = {
  SYNCED: 'SYNCED',
  DUPLICATE: 'DUPLICATE',
  FAILED: 'FAILED'
} as const;

export type SyncItemStatus = (typeof SyncItemStatuses)[keyof typeof SyncItemStatuses];

export type SyncBatchResult<TResult> = {
  processed: number;
  created: number;
  duplicates: number;
  failed: number;
  results: TResult[];
};

export type SyncLogEntry = {
  id: string;
  idempotencyKey: string;
  endpoint: SyncEndpoint;
  clientId?: string;
  deviceId?: string;
  payloadHash: string;
  processed: number;
  created: number;
  duplicates: number;
  failed: number;
  responseBody: unknown;
  createdAt: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return uuidPattern.test(value);
}

export function assertUuid(value: string, field: string): void {
  if (!isUuid(value)) {
    throw new Error(`${field} must be a valid UUID.`);
  }
}

export function assertNonEmptyString(value: string, field: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} must not be empty.`);
  }
}

export function hashPayload(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload ?? null)).digest('hex');
}
