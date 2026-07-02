using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Mobile.Core.Features.Observations;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Mobile.Core.Shared.Authorization;

namespace GyrMonitor.Mobile.Core.Features.Sync;

public sealed record MobileSyncSummary(int Synced, int Duplicated, int Failed, string? ErrorMessage);

public sealed class MobileSyncService
{
    private readonly IMobileSyncQueueRepository _queue;
    private readonly IPendingObservationRepository _observations;
    private readonly ISyncObservationsApi _syncApi;
    private readonly IAuthSession _authSession;
    private readonly string _clientId;

    public MobileSyncService(IMobileSyncQueueRepository queue, IPendingObservationRepository observations, ISyncObservationsApi syncApi, IAuthSession authSession, string clientId)
    {
        _queue = queue;
        _observations = observations;
        _syncApi = syncApi;
        _authSession = authSession;
        _clientId = clientId;
    }

    public async Task<int> GetPendingCountAsync()
    {
        var session = await GetSupportedSessionAsync();
        if (session is null)
        {
            return 0;
        }

        var pending = await _queue.GetPendingForUserAsync(session.UserId);
        return pending.Count;
    }

    public async Task<MobileSyncSummary> SyncPendingObservationsAsync()
    {
        var session = await GetSupportedSessionAsync();
        if (session is null)
        {
            return new MobileSyncSummary(0, 0, 0, "No supported mobile session is active.");
        }

        var pendingQueueItems = (await _queue.GetPendingForUserAsync(session.UserId))
            .Where(item => item.EntityType == SyncEntityTypes.Observation)
            .ToList();

        if (pendingQueueItems.Count == 0)
        {
            return new MobileSyncSummary(0, 0, 0, null);
        }

        var itemsByLocalId = new Dictionary<string, (SyncQueueItem Queue, PendingObservation Observation)>();
        foreach (var queueItem in pendingQueueItems)
        {
            var observation = await _observations.GetByLocalIdForUserAsync(queueItem.EntityLocalId, session.UserId);
            if (observation is not null)
            {
                itemsByLocalId[queueItem.EntityLocalId] = (queueItem, observation);
            }
        }

        if (itemsByLocalId.Count == 0)
        {
            return new MobileSyncSummary(0, 0, 0, null);
        }

        var request = new SyncObservationsRequestDto
        {
            ClientId = _clientId,
            Items = itemsByLocalId.Values
                .Select(pair => new SyncObservationItemRequestDto
                {
                    LocalId = pair.Observation.LocalId,
                    ObservationId = pair.Observation.ObservationId,
                    AlertId = pair.Observation.AlertId,
                    Comment = pair.Observation.Comment,
                    CreatedAt = pair.Observation.CreatedAt,
                    ClientId = pair.Observation.ClientId
                })
                .ToList()
        };

        var idempotencyKey = SyncIdempotency.ComputeKey(itemsByLocalId.Values.Select(pair => pair.Observation.ObservationId));

        try
        {
            var result = await _syncApi.SyncAsync(request, idempotencyKey);
            return await ApplyResultAsync(result, itemsByLocalId);
        }
        catch (Exception ex)
        {
            foreach (var (queueItem, observation) in itemsByLocalId.Values)
            {
                queueItem.Status = SyncStatuses.Failed;
                queueItem.RetryCount += 1;
                queueItem.LastError = ex.Message;
                await _queue.UpdateAsync(queueItem);

                observation.SyncStatus = SyncStatuses.Failed;
                await _observations.UpdateAsync(observation);
            }

            return new MobileSyncSummary(0, 0, itemsByLocalId.Count, ex.Message);
        }
    }

    private async Task<MobileSyncSummary> ApplyResultAsync(
        SyncObservationsResultDto result,
        Dictionary<string, (SyncQueueItem Queue, PendingObservation Observation)> itemsByLocalId)
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

            var (queueItem, observation) = pair;

            if (itemResult.Status == "FAILED")
            {
                queueItem.Status = SyncStatuses.Failed;
                queueItem.RetryCount += 1;
                queueItem.LastError = itemResult.Message;
                observation.SyncStatus = SyncStatuses.Failed;
                failed += 1;
            }
            else
            {
                queueItem.Status = SyncStatuses.Synced;
                queueItem.ServerId = itemResult.ServerId;
                queueItem.LastError = null;
                observation.SyncStatus = SyncStatuses.Synced;
                observation.ServerId = itemResult.ServerId;

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
            await _observations.UpdateAsync(observation);
        }

        return new MobileSyncSummary(synced, duplicated, failed, null);
    }

    private async Task<AuthSessionData?> GetSupportedSessionAsync()
    {
        var session = await _authSession.GetAsync();
        return MobileRoleAccess.IsSupported(session?.Role) ? session : null;
    }
}
