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

export function hashPayload(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload ?? null)).digest('hex');
}
