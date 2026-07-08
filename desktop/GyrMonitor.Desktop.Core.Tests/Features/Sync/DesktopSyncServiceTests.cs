using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Client.Core.Sync.Domain;
using GyrMonitor.Desktop.Core.Features.EventSimulator;
using GyrMonitor.Desktop.Core.Features.EventSimulator.Domain;
using GyrMonitor.Desktop.Core.Features.Sync;
using GyrMonitor.Desktop.Core.Features.Sync.Application;
using GyrMonitor.Desktop.Core.Features.Sync.Infrastructure;
using Moq;

namespace GyrMonitor.Desktop.Core.Tests.Features.Sync;

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

    private static SyncQueueItem Clone(SyncQueueItem item) => new()
    {
        LocalId = item.LocalId,
        EntityType = item.EntityType,
        EntityLocalId = item.EntityLocalId,
        Operation = item.Operation,
        Status = item.Status,
        RetryCount = item.RetryCount,
        CreatedAt = item.CreatedAt,
        ServerId = item.ServerId,
        LastError = item.LastError
    };
}

public sealed class InMemoryPendingEventRepository : IPendingEventRepository
{
    private readonly Dictionary<string, PendingEvent> _events = new();

    public Task AddAsync(PendingEvent pendingEvent)
    {
        _events[pendingEvent.LocalId] = Clone(pendingEvent);
        return Task.CompletedTask;
    }

    public Task<PendingEvent?> GetByLocalIdAsync(string localId)
    {
        return Task.FromResult(_events.TryGetValue(localId, out var value) ? Clone(value) : null);
    }

    public Task UpdateAsync(PendingEvent pendingEvent)
    {
        _events[pendingEvent.LocalId] = Clone(pendingEvent);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<PendingEvent>> GetAllAsync()
    {
        IReadOnlyList<PendingEvent> all = _events.Values.Select(Clone).ToList();
        return Task.FromResult(all);
    }

    private static PendingEvent Clone(PendingEvent pendingEvent) => new()
    {
        LocalId = pendingEvent.LocalId,
        EventId = pendingEvent.EventId,
        CattleId = pendingEvent.CattleId,
        EventType = pendingEvent.EventType,
        InactiveMinutes = pendingEvent.InactiveMinutes,
        Confidence = pendingEvent.Confidence,
        CapturedAt = pendingEvent.CapturedAt,
        Source = pendingEvent.Source,
        SyncStatus = pendingEvent.SyncStatus,
        ServerId = pendingEvent.ServerId
    };
}

public class DesktopSyncServiceTests
{
    private static async Task<(InMemorySyncQueueRepository Queue, InMemoryPendingEventRepository Events, string LocalId)> SeedPendingEventAsync()
    {
        var queue = new InMemorySyncQueueRepository();
        var events = new InMemoryPendingEventRepository();

        var pendingEvent = new PendingEvent
        {
            LocalId = "local-evt-1",
            EventId = "22222222-2222-4222-8222-222222222222",
            CattleId = "cattle-1",
            EventType = SimulatedEventTypes.Inactivity,
            InactiveMinutes = 80,
            Confidence = 0.9,
            CapturedAt = "2026-06-30T01:00:00.000Z",
            Source = SimulatedEventSource.DesktopSimulator,
            SyncStatus = SyncStatuses.Pending
        };
        await events.AddAsync(pendingEvent);

        await queue.AddAsync(new SyncQueueItem
        {
            LocalId = "queue-1",
            EntityType = SyncEntityTypes.Event,
            EntityLocalId = pendingEvent.LocalId,
            Operation = SyncOperations.Create,
            Status = SyncStatuses.Pending,
            CreatedAt = pendingEvent.CapturedAt
        });

        return (queue, events, pendingEvent.LocalId);
    }

    [Fact]
    public async Task SyncPendingEventsAsync_NoPendingItems_DoesNotCallApi()
    {
        var syncApi = new Mock<ISyncEventsApi>();
        var service = new DesktopSyncService(new InMemorySyncQueueRepository(), new InMemoryPendingEventRepository(), syncApi.Object, "DESKTOP-001", "DEVICE-001");

        var summary = await service.SyncPendingEventsAsync();

        Assert.Equal(0, summary.Synced + summary.Duplicated + summary.Failed);
        syncApi.Verify(api => api.SyncAsync(It.IsAny<SyncEventsRequestDto>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task SyncPendingEventsAsync_MarksItemSynced_OnSuccess()
    {
        var (queue, events, localId) = await SeedPendingEventAsync();

        var syncApi = new Mock<ISyncEventsApi>();
        syncApi
            .Setup(api => api.SyncAsync(It.IsAny<SyncEventsRequestDto>(), It.IsAny<string>()))
            .ReturnsAsync(new SyncEventsResultDto
            {
                Processed = 1,
                Created = 1,
                Duplicates = 0,
                Failed = 0,
                Results = new List<SyncEventItemResultDto> { new() { LocalId = localId, EventId = "22222222-2222-4222-8222-222222222222", Status = "SYNCED", ServerId = "22222222-2222-4222-8222-222222222222" } }
            });

        var service = new DesktopSyncService(queue, events, syncApi.Object, "DESKTOP-001", "DEVICE-001");

        var summary = await service.SyncPendingEventsAsync();

        Assert.Equal(1, summary.Synced);
        var queueItem = (await queue.GetAllAsync()).Single();
        Assert.Equal(SyncStatuses.Synced, queueItem.Status);
        Assert.Equal(0, await service.GetPendingCountAsync());
    }

    [Fact]
    public async Task SyncPendingEventsAsync_MarksItemFailedAndIncrementsRetryCount_OnItemFailure()
    {
        var (queue, events, localId) = await SeedPendingEventAsync();

        var syncApi = new Mock<ISyncEventsApi>();
        syncApi
            .Setup(api => api.SyncAsync(It.IsAny<SyncEventsRequestDto>(), It.IsAny<string>()))
            .ReturnsAsync(new SyncEventsResultDto
            {
                Processed = 1,
                Failed = 1,
                Results = new List<SyncEventItemResultDto> { new() { LocalId = localId, EventId = "x", Status = "FAILED", Message = "Cattle record was not found." } }
            });

        var service = new DesktopSyncService(queue, events, syncApi.Object, "DESKTOP-001", "DEVICE-001");

        var summary = await service.SyncPendingEventsAsync();

        Assert.Equal(1, summary.Failed);
        var queueItem = (await queue.GetAllAsync()).Single();
        Assert.Equal(SyncStatuses.Failed, queueItem.Status);
        Assert.Equal(1, queueItem.RetryCount);
    }

    [Fact]
    public async Task SyncPendingEventsAsync_UsesStableIdempotencyKey_ForTheSameUnchangedBatch()
    {
        var (queue, events, _) = await SeedPendingEventAsync();

        var syncApi = new Mock<ISyncEventsApi>();
        syncApi.Setup(api => api.SyncAsync(It.IsAny<SyncEventsRequestDto>(), It.IsAny<string>())).ThrowsAsync(new HttpRequestException("offline"));

        var service = new DesktopSyncService(queue, events, syncApi.Object, "DESKTOP-001", "DEVICE-001");

        await service.SyncPendingEventsAsync();
        var firstKey = (string)syncApi.Invocations.Last().Arguments[1];

        await service.SyncPendingEventsAsync();
        var secondKey = (string)syncApi.Invocations.Last().Arguments[1];

        Assert.Equal(firstKey, secondKey);
    }

    [Fact]
    public async Task SyncPendingEventsAsync_RaisesSyncCompleted_OnSuccess()
    {
        var (queue, events, localId) = await SeedPendingEventAsync();

        var syncApi = new Mock<ISyncEventsApi>();
        syncApi
            .Setup(api => api.SyncAsync(It.IsAny<SyncEventsRequestDto>(), It.IsAny<string>()))
            .ReturnsAsync(new SyncEventsResultDto
            {
                Processed = 1,
                Created = 1,
                Results = new List<SyncEventItemResultDto> { new() { LocalId = localId, EventId = "22222222-2222-4222-8222-222222222222", Status = "SYNCED", ServerId = "22222222-2222-4222-8222-222222222222" } }
            });

        var service = new DesktopSyncService(queue, events, syncApi.Object, "DESKTOP-001", "DEVICE-001");

        DesktopSyncSummary? raised = null;
        service.SyncCompleted += (_, summary) => raised = summary;

        await service.SyncPendingEventsAsync();

        Assert.NotNull(raised);
        Assert.Equal(1, raised!.Synced);
        Assert.Null(raised.ErrorMessage);
    }

    [Fact]
    public async Task SyncPendingEventsAsync_RaisesSyncCompleted_OnException()
    {
        var (queue, events, _) = await SeedPendingEventAsync();

        var syncApi = new Mock<ISyncEventsApi>();
        syncApi.Setup(api => api.SyncAsync(It.IsAny<SyncEventsRequestDto>(), It.IsAny<string>())).ThrowsAsync(new HttpRequestException("offline"));

        var service = new DesktopSyncService(queue, events, syncApi.Object, "DESKTOP-001", "DEVICE-001");

        DesktopSyncSummary? raised = null;
        service.SyncCompleted += (_, summary) => raised = summary;

        await service.SyncPendingEventsAsync();

        Assert.NotNull(raised);
        Assert.Equal(1, raised!.Failed);
        Assert.Equal("offline", raised.ErrorMessage);
    }

    [Fact]
    public async Task SyncPendingEventsAsync_RaisesSyncCompleted_WhenNothingPending()
    {
        var service = new DesktopSyncService(new InMemorySyncQueueRepository(), new InMemoryPendingEventRepository(), new Mock<ISyncEventsApi>().Object, "DESKTOP-001", "DEVICE-001");

        DesktopSyncSummary? raised = null;
        service.SyncCompleted += (_, summary) => raised = summary;

        await service.SyncPendingEventsAsync();

        Assert.NotNull(raised);
        Assert.Equal(0, raised!.Synced + raised.Duplicated + raised.Failed);
    }
}
