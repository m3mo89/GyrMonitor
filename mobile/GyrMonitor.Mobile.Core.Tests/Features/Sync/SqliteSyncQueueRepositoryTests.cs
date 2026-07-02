using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Mobile.Core.Features.Observations;
using GyrMonitor.Client.Core.Storage;
using SqliteSyncQueueRepository = GyrMonitor.Mobile.Core.Features.Sync.SqliteSyncQueueRepository;

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
    public async Task GetPendingForUserAsync_ExcludesOtherUsersItems()
    {
        var provider = new SqliteConnectionProvider(_databasePath);
        var queue = new SqliteSyncQueueRepository(provider);

        await queue.AddAsync(new SyncQueueItem { LocalId = "queue-1", EntityType = SyncEntityTypes.Observation, EntityLocalId = "obs-1", Status = SyncStatuses.Pending, CreatedAt = "t1", OwnerUserId = "user-1" });
        await queue.AddAsync(new SyncQueueItem { LocalId = "queue-2", EntityType = SyncEntityTypes.Observation, EntityLocalId = "obs-2", Status = SyncStatuses.Pending, CreatedAt = "t2", OwnerUserId = "user-2" });

        var pending = await queue.GetPendingForUserAsync("user-1");

        Assert.Single(pending);
        Assert.Equal("queue-1", pending[0].LocalId);
    }

    [Fact]
    public async Task GetPendingForUserAsync_ExcludesSyncedItems()
    {
        var provider = new SqliteConnectionProvider(_databasePath);
        var queue = new SqliteSyncQueueRepository(provider);

        await queue.AddAsync(new SyncQueueItem { LocalId = "queue-1", EntityType = SyncEntityTypes.Observation, EntityLocalId = "obs-1", Status = SyncStatuses.Pending, CreatedAt = "t1", OwnerUserId = "user-1" });
        await queue.AddAsync(new SyncQueueItem { LocalId = "queue-2", EntityType = SyncEntityTypes.Observation, EntityLocalId = "obs-2", Status = SyncStatuses.Synced, CreatedAt = "t2", OwnerUserId = "user-1" });

        var pending = await queue.GetPendingForUserAsync("user-1");

        Assert.Single(pending);
        Assert.Equal("queue-1", pending[0].LocalId);
    }

    [Fact]
    public async Task GetAllForUserAsync_ExcludesOtherUsersItems()
    {
        var provider = new SqliteConnectionProvider(_databasePath);
        var queue = new SqliteSyncQueueRepository(provider);

        await queue.AddAsync(new SyncQueueItem { LocalId = "queue-1", EntityType = SyncEntityTypes.Observation, EntityLocalId = "obs-1", Status = SyncStatuses.Synced, CreatedAt = "t1", OwnerUserId = "user-1" });
        await queue.AddAsync(new SyncQueueItem { LocalId = "queue-2", EntityType = SyncEntityTypes.Observation, EntityLocalId = "obs-2", Status = SyncStatuses.Pending, CreatedAt = "t2", OwnerUserId = "user-2" });

        var all = await queue.GetAllForUserAsync("user-1");

        Assert.Single(all);
        Assert.Equal("queue-1", all[0].LocalId);
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
            ClientId = "MOBILE-001",
            OwnerUserId = "user-1"
        });

        var found = await repository.GetByLocalIdForUserAsync("local-1", "user-1");

        Assert.NotNull(found);
        Assert.Equal(SyncStatuses.Pending, found!.SyncStatus);
    }

    [Fact]
    public async Task Data_SurvivesReopeningTheConnection()
    {
        var provider = new SqliteConnectionProvider(_databasePath);
        var repository = new SqlitePendingObservationRepository(provider);
        await repository.AddAsync(new PendingObservation { LocalId = "local-1", ObservationId = "obs-uuid", AlertId = "alert-1", Comment = "Checked", CreatedAt = "t", OwnerUserId = "user-1" });

        var reopened = new SqlitePendingObservationRepository(new SqliteConnectionProvider(_databasePath));
        var all = await reopened.GetAllAsync();

        Assert.Single(all);
    }

    [Fact]
    public async Task GetAllForUserAsync_ExcludesOtherUsersObservations()
    {
        var provider = new SqliteConnectionProvider(_databasePath);
        var repository = new SqlitePendingObservationRepository(provider);
        await repository.AddAsync(new PendingObservation { LocalId = "local-1", ObservationId = "obs-1", AlertId = "alert-1", Comment = "Mine", CreatedAt = "t1", OwnerUserId = "user-1" });
        await repository.AddAsync(new PendingObservation { LocalId = "local-2", ObservationId = "obs-2", AlertId = "alert-2", Comment = "Other", CreatedAt = "t2", OwnerUserId = "user-2" });

        var all = await repository.GetAllForUserAsync("user-1");

        Assert.Single(all);
        Assert.Equal("local-1", all[0].LocalId);
    }
}
