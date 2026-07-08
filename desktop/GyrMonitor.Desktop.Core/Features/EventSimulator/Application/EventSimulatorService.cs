using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Client.Core.Sync.Domain;
using GyrMonitor.Desktop.Core.Features.Cattle;
using GyrMonitor.Desktop.Core.Features.EventSimulator;
using GyrMonitor.Desktop.Core.Features.EventSimulator.Domain;

namespace GyrMonitor.Desktop.Core.Features.EventSimulator.Application;

public sealed class EventSimulatorService
{
    private readonly IPendingEventRepository _events;
    private readonly ISyncQueueRepository _syncQueue;
    private readonly ICattleApi _cattleApi;

    public EventSimulatorService(IPendingEventRepository events, ISyncQueueRepository syncQueue, ICattleApi cattleApi)
    {
        _events = events;
        _syncQueue = syncQueue;
        _cattleApi = cattleApi;
    }

    public async Task<IReadOnlyList<CattleSelectionItem>> LoadCattleAsync()
    {
        var cattle = await _cattleApi.GetCattleAsync();
        return cattle
            .Select(item => new CattleSelectionItem(item.Id, item.TagNumber, item.Status))
            .ToList();
    }

    public async Task GenerateAsync(string selectedCattleId, bool isInactivity, int inactiveMinutes, double confidence)
    {
        var now = DateTime.UtcNow.ToString("O");
        var pendingEvent = new PendingEvent
        {
            LocalId = Guid.NewGuid().ToString(),
            EventId = Guid.NewGuid().ToString(),
            CattleId = selectedCattleId,
            EventType = isInactivity ? SimulatedEventTypes.Inactivity : SimulatedEventTypes.Activity,
            InactiveMinutes = isInactivity ? inactiveMinutes : null,
            Confidence = confidence,
            CapturedAt = now,
            Source = SimulatedEventSource.DesktopSimulator,
            SyncStatus = SyncStatuses.Pending
        };

        await _events.AddAsync(pendingEvent);

        await _syncQueue.AddAsync(new SyncQueueItem
        {
            LocalId = Guid.NewGuid().ToString(),
            EntityType = SyncEntityTypes.Event,
            EntityLocalId = pendingEvent.LocalId,
            Operation = SyncOperations.Create,
            Status = SyncStatuses.Pending,
            CreatedAt = now
        });
    }
}
