using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Desktop.Core.Features.EventSimulator;

namespace GyrMonitor.Desktop.Core.Features.Sync;

public sealed record DesktopSyncSummary(int Synced, int Duplicated, int Failed, string? ErrorMessage);

public sealed class DesktopSyncService
{
    private readonly ISyncQueueRepository _queue;
    private readonly IPendingEventRepository _events;
    private readonly ISyncEventsApi _syncApi;
    private readonly string _clientId;
    private readonly string _deviceId;

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
            return new DesktopSyncSummary(0, 0, 0, null);
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
            return new DesktopSyncSummary(0, 0, 0, null);
        }

        var request = new SyncEventsRequestDto
        {
            ClientId = _clientId,
            DeviceId = _deviceId,
            Items = itemsByLocalId.Values
                .Select(pair => new SyncEventItemRequestDto
                {
                    LocalId = pair.Event.LocalId,
                    EventId = pair.Event.EventId,
                    CattleId = pair.Event.CattleId,
                    EventType = pair.Event.EventType,
                    InactiveMinutes = pair.Event.InactiveMinutes,
                    Confidence = pair.Event.Confidence,
                    CapturedAt = pair.Event.CapturedAt,
                    Source = pair.Event.Source
                })
                .ToList()
        };

        var idempotencyKey = SyncIdempotency.ComputeKey(itemsByLocalId.Values.Select(pair => pair.Event.EventId));

        try
        {
            var result = await _syncApi.SyncAsync(request, idempotencyKey);
            return await ApplyResultAsync(result, itemsByLocalId);
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

            return new DesktopSyncSummary(0, 0, itemsByLocalId.Count, ex.Message);
        }
    }

    private async Task<DesktopSyncSummary> ApplyResultAsync(
        SyncEventsResultDto result,
        Dictionary<string, (SyncQueueItem Queue, PendingEvent Event)> itemsByLocalId)
    {
        var synced = 0;
        var duplicated = 0;
        var failed = 0;

        foreach (var itemResult in result.Results)
        {
            if (!itemsByLocalId.TryGetValue(itemResult.LocalId, out var pair))
            {
                continue;
            }

            var (queueItem, pendingEvent) = pair;

            if (itemResult.Status == "FAILED")
            {
                queueItem.Status = SyncStatuses.Failed;
                queueItem.RetryCount += 1;
                queueItem.LastError = itemResult.Message;
                pendingEvent.SyncStatus = SyncStatuses.Failed;
                failed += 1;
            }
            else
            {
                queueItem.Status = SyncStatuses.Synced;
                queueItem.ServerId = itemResult.ServerId;
                queueItem.LastError = null;
                pendingEvent.SyncStatus = SyncStatuses.Synced;
                pendingEvent.ServerId = itemResult.ServerId;

                if (itemResult.Status == "DUPLICATE")
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
