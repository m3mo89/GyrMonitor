using GyrMonitor.Client.Core.Storage;
using GyrMonitor.Client.Core.Sync.Domain;
using GyrMonitor.Client.Core.Sync.Infrastructure;

namespace GyrMonitor.Client.Core.Tests.Sync;

public class SqliteSyncQueueRepositoryTests : IDisposable
{
    private readonly string _databasePath;

    public SqliteSyncQueueRepositoryTests()
    {
        _databasePath = Path.Combine(Path.GetTempPath(), $"gyrmonitor-shared-sync-{Guid.NewGuid():N}.db3");
    }

    public void Dispose()
    {
        if (File.Exists(_databasePath))
        {
            File.Delete(_databasePath);
        }
    }

    [Fact]
    public async Task AddAndGetPending_ReturnsQueuedItemWithStableLocalId()
    {
        var provider = new SqliteConnectionProvider(_databasePath);
        var queue = new SqliteSyncQueueRepository(provider);

        await queue.AddAsync(new SyncQueueItem
        {
            LocalId = "queue-1",
            EntityType = SyncEntityTypes.Event,
            EntityLocalId = "evt-1",
            Operation = SyncOperations.Create,
            Status = SyncStatuses.Pending,
            CreatedAt = "2026-06-30T02:00:00.000Z"
        });

        var pending = await queue.GetPendingAsync();

        Assert.Single(pending);
        Assert.Equal("queue-1", pending[0].LocalId);
        Assert.Equal(0, pending[0].RetryCount);
    }

    [Fact]
    public async Task UpdateAsync_PersistsRetryCountAndStatus()
    {
        var provider = new SqliteConnectionProvider(_databasePath);
        var queue = new SqliteSyncQueueRepository(provider);
        var item = new SyncQueueItem
        {
            LocalId = "queue-1",
            EntityType = SyncEntityTypes.Event,
            EntityLocalId = "evt-1",
            Status = SyncStatuses.Pending,
            CreatedAt = "2026-06-30T02:00:00.000Z"
        };
        await queue.AddAsync(item);

        item.Status = SyncStatuses.Failed;
        item.RetryCount = 1;
        item.LastError = "network error";
        await queue.UpdateAsync(item);

        var all = await queue.GetAllAsync();
        Assert.Equal(SyncStatuses.Failed, all[0].Status);
        Assert.Equal(1, all[0].RetryCount);
        Assert.Equal("network error", all[0].LastError);
    }

    [Fact]
    public async Task GetPendingAsync_ExcludesSyncedItems()
    {
        var provider = new SqliteConnectionProvider(_databasePath);
        var queue = new SqliteSyncQueueRepository(provider);

        await queue.AddAsync(new SyncQueueItem { LocalId = "queue-1", EntityType = SyncEntityTypes.Event, EntityLocalId = "evt-1", Status = SyncStatuses.Pending, CreatedAt = "t1" });
        await queue.AddAsync(new SyncQueueItem { LocalId = "queue-2", EntityType = SyncEntityTypes.Event, EntityLocalId = "evt-2", Status = SyncStatuses.Synced, CreatedAt = "t2" });

        var pending = await queue.GetPendingAsync();

        Assert.Single(pending);
        Assert.Equal("queue-1", pending[0].LocalId);
    }

    [Fact]
    public async Task Data_SurvivesReopeningTheConnection()
    {
        var provider = new SqliteConnectionProvider(_databasePath);
        var queue = new SqliteSyncQueueRepository(provider);
        await queue.AddAsync(new SyncQueueItem { LocalId = "queue-1", EntityType = SyncEntityTypes.Event, EntityLocalId = "evt-1", Status = SyncStatuses.Pending, CreatedAt = "t1" });

        var reopened = new SqliteSyncQueueRepository(new SqliteConnectionProvider(_databasePath));
        var all = await reopened.GetAllAsync();

        Assert.Single(all);
    }
}
