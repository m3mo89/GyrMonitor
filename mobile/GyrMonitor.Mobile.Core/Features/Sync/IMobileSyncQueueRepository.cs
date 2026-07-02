using GyrMonitor.Client.Core.Sync;

namespace GyrMonitor.Mobile.Core.Features.Sync;

public interface IMobileSyncQueueRepository : ISyncQueueRepository
{
    Task<IReadOnlyList<SyncQueueItem>> GetPendingForUserAsync(string ownerUserId);

    Task<IReadOnlyList<SyncQueueItem>> GetAllForUserAsync(string ownerUserId);
}
