import type { SyncLogRepository } from '../application/offline-sync.types';
import type { SyncLogEntry } from '../domain/sync-log';

export class LocalSyncLogRepository implements SyncLogRepository {
  private readonly entriesById = new Map<string, SyncLogEntry>();
  private readonly idByIdempotencyKey = new Map<string, string>();

  async record(entry: SyncLogEntry): Promise<SyncLogEntry> {
    const stored = this.clone(entry);
    this.entriesById.set(stored.id, stored);
    this.idByIdempotencyKey.set(stored.idempotencyKey, stored.id);
    return this.clone(stored);
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<SyncLogEntry | null> {
    const id = this.idByIdempotencyKey.get(idempotencyKey);
    if (!id) {
      return null;
    }

    return this.clone(this.entriesById.get(id) as SyncLogEntry);
  }

  async listByClientId(clientId: string, limit: number): Promise<SyncLogEntry[]> {
    return this.sortedEntries()
      .filter((entry) => entry.clientId === clientId)
      .slice(0, limit);
  }

  async listRecent(limit: number): Promise<SyncLogEntry[]> {
    return this.sortedEntries().slice(0, limit);
  }

  private sortedEntries(): SyncLogEntry[] {
    return [...this.entriesById.values()]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((entry) => this.clone(entry));
  }

  private clone(entry: SyncLogEntry): SyncLogEntry {
    return { ...entry };
  }
}
