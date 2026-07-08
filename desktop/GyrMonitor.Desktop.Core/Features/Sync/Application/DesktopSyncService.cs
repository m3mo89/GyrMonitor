using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Client.Core.Sync.Domain;
using GyrMonitor.Desktop.Core.Features.EventSimulator;
using GyrMonitor.Desktop.Core.Features.EventSimulator.Domain;
using GyrMonitor.Desktop.Core.Features.Sync;
using GyrMonitor.Desktop.Core.Features.Sync.Infrastructure;

namespace GyrMonitor.Desktop.Core.Features.Sync.Application;

public sealed record DesktopSyncSummary(int Synced, int Duplicated, int Failed, string? ErrorMessage);

public sealed class DesktopSyncService
{
    private readonly ISyncQueueRepository _queue;
    private readonly IPendingEventRepository _events;
    private readonly ISyncEventsApi _syncApi;
    private readonly string _clientId;
    private readonly string _deviceId;

    public event EventHandler<DesktopSyncSummary>? SyncCompleted;

    public DesktopSyncService(ISyncQueueRepository queue, IPendingEventRepository events, ISyncEventsApi syncApi, string clientId, string deviceId)
    {
        _queue = queue;
        _events = events;
        _syncApi = syncApi;
        _clientId = clientId;
        _deviceId = deviceId;
    }

    public async Task<int> GetPendingCountAsync()
    {
        var pending = await _queue.GetPendingAsync();
        return pending.Count;
    }

    public async Task<DesktopSyncSummary> SyncPendingEventsAsync()
    {
        var pendingQueueItems = (await _queue.GetPendingAsync())
            .Where(item => item.EntityType == SyncEntityTypes.Event)
            .ToList();

        if (pendingQueueItems.Count == 0)
        {
            return Complete(new DesktopSyncSummary(0, 0, 0, null));
        }

        var itemsByLocalId = new Dictionary<string, (SyncQueueItem Queue, PendingEvent Event)>();
        foreach (var queueItem in pendingQueueItems)
        {
            var pendingEvent = await _events.GetByLocalIdAsync(queueItem.EntityLocalId);
            if (pendingEvent is not null)
            {
                itemsByLocalId[queueItem.EntityLocalId] = (queueItem, pendingEvent);
            }
        }

        if (itemsByLocalId.Count == 0)
        {
            return Complete(new DesktopSyncSummary(0, 0, 0, null));
        }

        var request = SyncEventsMapper.ToRequestDto(_clientId, _deviceId, itemsByLocalId.Values.Select(pair => pair.Event));
        var idempotencyKey = SyncIdempotency.ComputeKey(itemsByLocalId.Values.Select(pair => pair.Event.EventId));

        try
        {
            var result = await _syncApi.SyncAsync(request, idempotencyKey);
            var outcomes = SyncEventsMapper.ToOutcomes(result);
            return Complete(await ApplyOutcomesAsync(outcomes, itemsByLocalId));
        }
        catch (Exception ex)
        {
            foreach (var (queueItem, pendingEvent) in itemsByLocalId.Values)
            {
                queueItem.Status = SyncStatuses.Failed;
                queueItem.RetryCount += 1;
                queueItem.LastError = ex.Message;
                await _queue.UpdateAsync(queueItem);

                pendingEvent.SyncStatus = SyncStatuses.Failed;
                await _events.UpdateAsync(pendingEvent);
            }

            return Complete(new DesktopSyncSummary(0, 0, itemsByLocalId.Count, ex.Message));
        }
    }

    private DesktopSyncSummary Complete(DesktopSyncSummary summary)
    {
        SyncCompleted?.Invoke(this, summary);
        return summary;
    }

    private async Task<DesktopSyncSummary> ApplyOutcomesAsync(
        IReadOnlyDictionary<string, SyncItemOutcome> outcomes,
        Dictionary<string, (SyncQueueItem Queue, PendingEvent Event)> itemsByLocalId)
    {
        var synced = 0;
        var duplicated = 0;
        var failed = 0;

        foreach (var (localId, outcome) in outcomes)
        {
            if (!itemsByLocalId.TryGetValue(localId, out var pair))
            {
                continue;
            }

            var (queueItem, pendingEvent) = pair;

            if (outcome.Kind == SyncItemOutcomeKind.Failed)
            {
                queueItem.Status = SyncStatuses.Failed;
                queueItem.RetryCount += 1;
                queueItem.LastError = outcome.Message;
                pendingEvent.SyncStatus = SyncStatuses.Failed;
                failed += 1;
            }
            else
            {
                queueItem.Status = SyncStatuses.Synced;
                queueItem.ServerId = outcome.ServerId;
                queueItem.LastError = null;
                pendingEvent.SyncStatus = SyncStatuses.Synced;
                pendingEvent.ServerId = outcome.ServerId;

                if (outcome.Kind == SyncItemOutcomeKind.Duplicate)
                {
                    duplicated += 1;
                }
                else
                {
                    synced += 1;
                }
            }

            await _queue.UpdateAsync(queueItem);
            await _events.UpdateAsync(pendingEvent);
        }

        return new DesktopSyncSummary(synced, duplicated, failed, null);
    }

}
