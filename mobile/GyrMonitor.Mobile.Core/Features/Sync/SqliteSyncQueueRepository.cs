using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Client.Core.Storage;

namespace GyrMonitor.Mobile.Core.Features.Sync;

public sealed class SqliteSyncQueueRepository : GyrMonitor.Client.Core.Sync.SqliteSyncQueueRepository, IMobileSyncQueueRepository
{
    public SqliteSyncQueueRepository(ISqliteConnectionProvider connectionProvider)
        : base(connectionProvider)
    {
    }

    public async Task<IReadOnlyList<SyncQueueItem>> GetPendingForUserAsync(string ownerUserId)
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<SyncQueueItem>()
            .Where(item => item.OwnerUserId == ownerUserId && (item.Status == SyncStatuses.Pending || item.Status == SyncStatuses.Failed))
            .OrderBy(item => item.CreatedAt)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<SyncQueueItem>> GetAllForUserAsync(string ownerUserId)
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<SyncQueueItem>()
            .Where(item => item.OwnerUserId == ownerUserId)
            .OrderByDescending(item => item.CreatedAt)
            .ToListAsync();
    }
}
