namespace GyrMonitor.Mobile.Core.Features.Sync;

public interface ISyncQueueRepository
{
    Task AddAsync(SyncQueueItem item);

    Task<IReadOnlyList<SyncQueueItem>> GetPendingAsync();

    Task UpdateAsync(SyncQueueItem item);

    Task<IReadOnlyList<SyncQueueItem>> GetAllAsync();
}
