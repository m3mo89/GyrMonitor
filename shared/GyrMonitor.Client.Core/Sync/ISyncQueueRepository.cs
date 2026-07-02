namespace GyrMonitor.Client.Core.Sync;

public interface ISyncQueueRepository
{
    Task AddAsync(SyncQueueItem item);

    Task<IReadOnlyList<SyncQueueItem>> GetPendingAsync();

    Task UpdateAsync(SyncQueueItem item);

    Task<IReadOnlyList<SyncQueueItem>> GetAllAsync();
}
