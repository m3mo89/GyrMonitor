using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Mobile.Core.Features.Observations;
using GyrMonitor.Mobile.Core.Features.Sync;
using Moq;

namespace GyrMonitor.Mobile.Core.Tests.Features.Sync;

public sealed class InMemorySyncQueueRepository : ISyncQueueRepository
{
    private readonly Dictionary<string, SyncQueueItem> _items = new();

    public Task AddAsync(SyncQueueItem item)
    {
        _items[item.LocalId] = Clone(item);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<SyncQueueItem>> GetPendingAsync()
    {
        IReadOnlyList<SyncQueueItem> pending = _items.Values
            .Where(item => item.Status is SyncStatuses.Pending or SyncStatuses.Failed)
            .Select(Clone)
            .ToList();
        return Task.FromResult(pending);
    }

    public Task<IReadOnlyList<SyncQueueItem>> GetPendingForUserAsync(string ownerUserId)
    {
        IReadOnlyList<SyncQueueItem> pending = _items.Values
            .Where(item => item.OwnerUserId == ownerUserId && item.Status is SyncStatuses.Pending or SyncStatuses.Failed)
            .Select(Clone)
            .ToList();
        return Task.FromResult(pending);
    }

    public Task UpdateAsync(SyncQueueItem item)
    {
        _items[item.LocalId] = Clone(item);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<SyncQueueItem>> GetAllAsync()
    {
        IReadOnlyList<SyncQueueItem> all = _items.Values.Select(Clone).ToList();
        return Task.FromResult(all);
    }

    public Task<IReadOnlyList<SyncQueueItem>> GetAllForUserAsync(string ownerUserId)
    {
        IReadOnlyList<SyncQueueItem> all = _items.Values.Where(item => item.OwnerUserId == ownerUserId).Select(Clone).ToList();
        return Task.FromResult(all);
    }

    private static SyncQueueItem Clone(SyncQueueItem item) => new()
    {
        LocalId = item.LocalId,
        EntityType = item.EntityType,
        EntityLocalId = item.EntityLocalId,
        Operation = item.Operation,
        Status = item.Status,
        RetryCount = item.RetryCount,
        CreatedAt = item.CreatedAt,
        OwnerUserId = item.OwnerUserId,
        ServerId = item.ServerId,
        LastError = item.LastError
    };
}

public sealed class InMemoryPendingObservationRepository : IPendingObservationRepository
{
    private readonly Dictionary<string, PendingObservation> _observations = new();

    public Task AddAsync(PendingObservation observation)
    {
        _observations[observation.LocalId] = Clone(observation);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<PendingObservation>> GetPendingAsync()
    {
        IReadOnlyList<PendingObservation> pending = _observations.Values
            .Where(o => o.SyncStatus is SyncStatuses.Pending or SyncStatuses.Failed)
            .Select(Clone)
            .ToList();
        return Task.FromResult(pending);
    }

    public Task<IReadOnlyList<PendingObservation>> GetPendingForUserAsync(string ownerUserId)
    {
        IReadOnlyList<PendingObservation> pending = _observations.Values
            .Where(o => o.OwnerUserId == ownerUserId && o.SyncStatus is SyncStatuses.Pending or SyncStatuses.Failed)
            .Select(Clone)
            .ToList();
        return Task.FromResult(pending);
    }

    public Task<PendingObservation?> GetByLocalIdAsync(string localId)
    {
        return Task.FromResult(_observations.TryGetValue(localId, out var value) ? Clone(value) : null);
    }

    public Task<PendingObservation?> GetByLocalIdForUserAsync(string localId, string ownerUserId)
    {
        return Task.FromResult(_observations.TryGetValue(localId, out var value) && value.OwnerUserId == ownerUserId ? Clone(value) : null);
    }

    public Task UpdateAsync(PendingObservation observation)
    {
        _observations[observation.LocalId] = Clone(observation);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<PendingObservation>> GetAllAsync()
    {
        IReadOnlyList<PendingObservation> all = _observations.Values.Select(Clone).ToList();
        return Task.FromResult(all);
    }

    public Task<IReadOnlyList<PendingObservation>> GetAllForUserAsync(string ownerUserId)
    {
        IReadOnlyList<PendingObservation> all = _observations.Values.Where(o => o.OwnerUserId == ownerUserId).Select(Clone).ToList();
        return Task.FromResult(all);
    }

    private static PendingObservation Clone(PendingObservation observation) => new()
    {
        LocalId = observation.LocalId,
        ObservationId = observation.ObservationId,
        AlertId = observation.AlertId,
        Comment = observation.Comment,
        CreatedAt = observation.CreatedAt,
        ClientId = observation.ClientId,
        OwnerUserId = observation.OwnerUserId,
        SyncStatus = observation.SyncStatus,
        ServerId = observation.ServerId
    };
}

public class MobileSyncServiceTests
{
    private const string UserId = "user-1";

    private static async Task<(InMemorySyncQueueRepository Queue, InMemoryPendingObservationRepository Observations, string LocalId)> SeedPendingObservationAsync()
    {
        var queue = new InMemorySyncQueueRepository();
        var observations = new InMemoryPendingObservationRepository();

        var observation = new PendingObservation
        {
            LocalId = "local-obs-1",
            ObservationId = "22222222-2222-4222-8222-222222222222",
            AlertId = "alert-1",
            Comment = "Checked in field",
            CreatedAt = "2026-06-30T02:00:00.000Z",
            ClientId = "MOBILE-001",
            OwnerUserId = UserId,
            SyncStatus = SyncStatuses.Pending
        };
        await observations.AddAsync(observation);

        await queue.AddAsync(new SyncQueueItem
        {
            LocalId = "queue-1",
            EntityType = SyncEntityTypes.Observation,
            EntityLocalId = observation.LocalId,
            Operation = SyncOperations.Create,
            Status = SyncStatuses.Pending,
            CreatedAt = observation.CreatedAt,
            OwnerUserId = UserId
        });

        return (queue, observations, observation.LocalId);
    }

    [Fact]
    public async Task SyncPendingObservationsAsync_NoPendingItems_DoesNotCallApi()
    {
        var syncApi = new Mock<ISyncObservationsApi>();
        var service = CreateService(new InMemorySyncQueueRepository(), new InMemoryPendingObservationRepository(), syncApi.Object);

        var summary = await service.SyncPendingObservationsAsync();

        Assert.Equal(0, summary.Synced + summary.Duplicated + summary.Failed);
        syncApi.Verify(api => api.SyncAsync(It.IsAny<SyncObservationsRequestDto>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task SyncPendingObservationsAsync_MarksItemSynced_OnSuccess()
    {
        var (queue, observations, localId) = await SeedPendingObservationAsync();

        var syncApi = new Mock<ISyncObservationsApi>();
        syncApi
            .Setup(api => api.SyncAsync(It.IsAny<SyncObservationsRequestDto>(), It.IsAny<string>()))
            .ReturnsAsync(new SyncObservationsResultDto
            {
                Processed = 1,
                Created = 1,
                Duplicates = 0,
                Failed = 0,
                Results = new List<SyncObservationItemResultDto>
                {
                    new() { LocalId = localId, ObservationId = "22222222-2222-4222-8222-222222222222", Status = "SYNCED", ServerId = "server-1" }
                }
            });

        var service = CreateService(queue, observations, syncApi.Object);

        var summary = await service.SyncPendingObservationsAsync();

        Assert.Equal(1, summary.Synced);
        Assert.Equal(0, summary.Failed);

        var queueItems = await queue.GetAllAsync();
        Assert.Equal(SyncStatuses.Synced, queueItems.Single().Status);
        Assert.Equal("server-1", queueItems.Single().ServerId);

        var storedObservations = await observations.GetAllAsync();
        Assert.Equal(SyncStatuses.Synced, storedObservations.Single().SyncStatus);
        Assert.Equal(0, (await service.GetPendingCountAsync()));
    }

    [Fact]
    public async Task SyncPendingObservationsAsync_MarksItemFailedAndIncrementsRetryCount_OnItemFailure()
    {
        var (queue, observations, localId) = await SeedPendingObservationAsync();

        var syncApi = new Mock<ISyncObservationsApi>();
        syncApi
            .Setup(api => api.SyncAsync(It.IsAny<SyncObservationsRequestDto>(), It.IsAny<string>()))
            .ReturnsAsync(new SyncObservationsResultDto
            {
                Processed = 1,
                Created = 0,
                Duplicates = 0,
                Failed = 1,
                Results = new List<SyncObservationItemResultDto>
                {
                    new() { LocalId = localId, ObservationId = "22222222-2222-4222-8222-222222222222", Status = "FAILED", Message = "Alert not found" }
                }
            });

        var service = CreateService(queue, observations, syncApi.Object);

        var summary = await service.SyncPendingObservationsAsync();

        Assert.Equal(1, summary.Failed);
        var queueItem = (await queue.GetAllAsync()).Single();
        Assert.Equal(SyncStatuses.Failed, queueItem.Status);
        Assert.Equal(1, queueItem.RetryCount);
        Assert.Equal("Alert not found", queueItem.LastError);
    }

    [Fact]
    public async Task SyncPendingObservationsAsync_MarksItemsFailed_WhenNetworkCallThrows()
    {
        var (queue, observations, _) = await SeedPendingObservationAsync();

        var syncApi = new Mock<ISyncObservationsApi>();
        syncApi.Setup(api => api.SyncAsync(It.IsAny<SyncObservationsRequestDto>(), It.IsAny<string>())).ThrowsAsync(new HttpRequestException("offline"));

        var service = CreateService(queue, observations, syncApi.Object);

        var summary = await service.SyncPendingObservationsAsync();

        Assert.Equal(1, summary.Failed);
        var queueItem = (await queue.GetAllAsync()).Single();
        Assert.Equal(SyncStatuses.Failed, queueItem.Status);
        Assert.Equal(1, queueItem.RetryCount);
    }

    [Fact]
    public async Task SyncPendingObservationsAsync_UsesStableIdempotencyKey_ForTheSameUnchangedBatch()
    {
        string? firstKey = null;
        string? secondKey = null;

        var (queue, observations, localId) = await SeedPendingObservationAsync();

        var syncApi = new Mock<ISyncObservationsApi>();
        syncApi
            .Setup(api => api.SyncAsync(It.IsAny<SyncObservationsRequestDto>(), It.IsAny<string>()))
            .ThrowsAsync(new HttpRequestException("simulated timeout, client does not know server outcome"));

        var service = CreateService(queue, observations, syncApi.Object);

        await service.SyncPendingObservationsAsync();
        firstKey = GetLastCapturedKey(syncApi);

        // Retry queue item is now FAILED, still eligible for GetPendingAsync(), and the underlying
        // observation set sent to the server has not changed, so the client must reuse the same key.
        await service.SyncPendingObservationsAsync();
        secondKey = GetLastCapturedKey(syncApi);

        Assert.False(string.IsNullOrWhiteSpace(firstKey));
        Assert.Equal(firstKey, secondKey);
    }

    [Fact]
    public async Task SyncPendingObservationsAsync_ExcludesOtherUsersPendingObservations()
    {
        var (queue, observations, _) = await SeedPendingObservationAsync();
        await observations.AddAsync(new PendingObservation
        {
            LocalId = "local-obs-2",
            ObservationId = "33333333-3333-4333-8333-333333333333",
            AlertId = "alert-2",
            Comment = "Other user",
            CreatedAt = "2026-06-30T03:00:00.000Z",
            ClientId = "MOBILE-001",
            OwnerUserId = "user-2",
            SyncStatus = SyncStatuses.Pending
        });
        await queue.AddAsync(new SyncQueueItem
        {
            LocalId = "queue-2",
            EntityType = SyncEntityTypes.Observation,
            EntityLocalId = "local-obs-2",
            Operation = SyncOperations.Create,
            Status = SyncStatuses.Pending,
            CreatedAt = "2026-06-30T03:00:00.000Z",
            OwnerUserId = "user-2"
        });

        SyncObservationsRequestDto? captured = null;
        var syncApi = new Mock<ISyncObservationsApi>();
        syncApi
            .Setup(api => api.SyncAsync(It.IsAny<SyncObservationsRequestDto>(), It.IsAny<string>()))
            .Callback<SyncObservationsRequestDto, string>((request, _) => captured = request)
            .ReturnsAsync(new SyncObservationsResultDto
            {
                Processed = 1,
                Created = 1,
                Results = new List<SyncObservationItemResultDto>
                {
                    new() { LocalId = "local-obs-1", ObservationId = "22222222-2222-4222-8222-222222222222", Status = "SYNCED", ServerId = "server-1" }
                }
            });

        var service = CreateService(queue, observations, syncApi.Object);

        await service.SyncPendingObservationsAsync();

        Assert.NotNull(captured);
        Assert.Single(captured!.Items);
        Assert.Equal("local-obs-1", captured.Items[0].LocalId);
        Assert.Equal(0, await service.GetPendingCountAsync());
    }

    private static string? GetLastCapturedKey(Mock<ISyncObservationsApi> syncApi)
    {
        var invocation = syncApi.Invocations.Last();
        return (string)invocation.Arguments[1];
    }

    private static MobileSyncService CreateService(ISyncQueueRepository queue, IPendingObservationRepository observations, ISyncObservationsApi syncApi)
    {
        var authSession = new Mock<IAuthSession>();
        authSession.Setup(session => session.GetAsync()).ReturnsAsync(new AuthSessionData("token", UserId, "Field", "field@example.com", "FIELD_OPERATOR"));
        return new MobileSyncService(queue, observations, syncApi, authSession.Object, "MOBILE-001");
    }
}
