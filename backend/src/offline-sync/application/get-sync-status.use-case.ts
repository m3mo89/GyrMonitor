import type { GetSyncStatusQuery, SyncLogRepository, SyncStatusResponseDto } from './offline-sync.types';

const DEFAULT_STATUS_LIMIT = 20;

export class GetSyncStatusUseCase {
  private readonly logs: SyncLogRepository;

  constructor(logs: SyncLogRepository) {
    this.logs = logs;
  }

  async execute(query: GetSyncStatusQuery): Promise<SyncStatusResponseDto> {
    const entries = query.clientId
      ? await this.logs.listByClientId(query.clientId, DEFAULT_STATUS_LIMIT)
      : await this.logs.listRecent(DEFAULT_STATUS_LIMIT);

    return {
      attempts: entries.map((entry) => ({
        endpoint: entry.endpoint,
        clientId: entry.clientId,
        deviceId: entry.deviceId,
        processed: entry.processed,
        created: entry.created,
        duplicates: entry.duplicates,
        failed: entry.failed,
        syncedAt: entry.createdAt
      }))
    };
  }
}
