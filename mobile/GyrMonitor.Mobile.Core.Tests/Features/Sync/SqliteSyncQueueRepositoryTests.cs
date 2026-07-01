using GyrMonitor.Mobile.Core.Features.Observations;
using GyrMonitor.Mobile.Core.Features.Sync;
using GyrMonitor.Mobile.Core.Shared.Storage;

namespace GyrMonitor.Mobile.Core.Tests.Features.Sync;

public class SqliteSyncQueueRepositoryTests : IDisposable
{
    private readonly string _databasePath;

    public SqliteSyncQueueRepositoryTests()
    {
        _databasePath = Path.Combine(Path.GetTempPath(), $"gyrmonitor-mobile-sync-{Guid.NewGuid():N}.db3");
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
            EntityType = SyncEntityTypes.Observation,
            EntityLocalId = "obs-1",
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
            EntityType = SyncEntityTypes.Observation,
            EntityLocalId = "obs-1",
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

        await queue.AddAsync(new SyncQueueItem { LocalId = "queue-1", EntityType = SyncEntityTypes.Observation, EntityLocalId = "obs-1", Status = SyncStatuses.Pending, CreatedAt = "t1" });
        await queue.AddAsync(new SyncQueueItem { LocalId = "queue-2", EntityType = SyncEntityTypes.Observation, EntityLocalId = "obs-2", Status = SyncStatuses.Synced, CreatedAt = "t2" });

        var pending = await queue.GetPendingAsync();

        Assert.Single(pending);
        Assert.Equal("queue-1", pending[0].LocalId);
    }
}

public class SqlitePendingObservationRepositoryTests : IDisposable
{
    private readonly string _databasePath;

    public SqlitePendingObservationRepositoryTests()
    {
        _databasePath = Path.Combine(Path.GetTempPath(), $"gyrmonitor-mobile-obs-{Guid.NewGuid():N}.db3");
    }

    public void Dispose()
    {
        if (File.Exists(_databasePath))
        {
            File.Delete(_databasePath);
        }
    }

    [Fact]
    public async Task AddAndGetByLocalId_PersistsPendingObservation()
    {
        var provider = new SqliteConnectionProvider(_databasePath);
        var repository = new SqlitePendingObservationRepository(provider);

        await repository.AddAsync(new PendingObservation
        {
            LocalId = "local-1",
            ObservationId = "22222222-2222-4222-8222-222222222222",
            AlertId = "alert-1",
            Comment = "Checked in field",
            CreatedAt = "2026-06-30T02:00:00.000Z",
            ClientId = "MOBILE-001"
        });

        var found = await repository.GetByLocalIdAsync("local-1");

        Assert.NotNull(found);
        Assert.Equal(SyncStatuses.Pending, found!.SyncStatus);
    }

    [Fact]
    public async Task Data_SurvivesReopeningTheConnection()
    {
        var provider = new SqliteConnectionProvider(_databasePath);
        var repository = new SqlitePendingObservationRepository(provider);
        await repository.AddAsync(new PendingObservation { LocalId = "local-1", ObservationId = "obs-uuid", AlertId = "alert-1", Comment = "Checked", CreatedAt = "t" });

        var reopened = new SqlitePendingObservationRepository(new SqliteConnectionProvider(_databasePath));
        var all = await reopened.GetAllAsync();

        Assert.Single(all);
    }
}
