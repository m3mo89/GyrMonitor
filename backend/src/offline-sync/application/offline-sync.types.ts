import type { SyncBatchResult, SyncEndpoint, SyncItemStatus, SyncLogEntry } from '../domain/sync-log';

export type SyncEventItemRequestDto = {
  localId: string;
  eventId: string;
  cattleId: string;
  eventType: string;
  inactiveMinutes?: number;
  confidence: number;
  capturedAt: string;
  source: string;
};

export type SyncEventsRequestDto = {
  clientId?: string;
  deviceId?: string;
  items: SyncEventItemRequestDto[];
};

export type SyncEventsCommand = SyncEventsRequestDto & {
  idempotencyKey: string;
};

export type SyncEventItemResultDto = {
  localId: string;
  eventId: string;
  status: SyncItemStatus;
  serverId?: string;
  message?: string;
};

export type SyncEventsResultDto = SyncBatchResult<SyncEventItemResultDto>;

export type SyncObservationItemRequestDto = {
  localId: string;
  observationId: string;
  alertId: string;
  comment: string;
  createdAt: string;
  clientId?: string;
};

export type SyncObservationsRequestDto = {
  clientId?: string;
  items: SyncObservationItemRequestDto[];
};

export type SyncObservationsCommand = SyncObservationsRequestDto & {
  idempotencyKey: string;
  userId: string;
};

export type SyncObservationItemResultDto = {
  localId: string;
  observationId: string;
  status: SyncItemStatus;
  serverId?: string;
  message?: string;
};

export type SyncObservationsResultDto = SyncBatchResult<SyncObservationItemResultDto>;

export type SyncLogRepository = {
  findByIdempotencyKey(idempotencyKey: string): Promise<SyncLogEntry | null>;
  record(entry: SyncLogEntry): Promise<SyncLogEntry>;
  listByClientId(clientId: string, limit: number): Promise<SyncLogEntry[]>;
  listRecent(limit: number): Promise<SyncLogEntry[]>;
};

export type GetSyncStatusQuery = {
  clientId?: string;
};

export type SyncAttemptSummaryDto = {
  endpoint: SyncEndpoint;
  clientId?: string;
  deviceId?: string;
  processed: number;
  created: number;
  duplicates: number;
  failed: number;
  syncedAt: string;
};

export type SyncStatusResponseDto = {
  attempts: SyncAttemptSummaryDto[];
};
