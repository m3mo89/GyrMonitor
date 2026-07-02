using GyrMonitor.Client.Core.Sync;

namespace GyrMonitor.Mobile.Core.Features.Sync;

public interface ISyncQueueRepository
{
    Task AddAsync(SyncQueueItem item);

    Task<IReadOnlyList<SyncQueueItem>> GetPendingAsync();

    Task<IReadOnlyList<SyncQueueItem>> GetPendingForUserAsync(string ownerUserId);

    Task UpdateAsync(SyncQueueItem item);

    Task<IReadOnlyList<SyncQueueItem>> GetAllAsync();

    Task<IReadOnlyList<SyncQueueItem>> GetAllForUserAsync(string ownerUserId);
}
