using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Client.Core.Sync.Domain;
using GyrMonitor.Mobile.Core.Features.Observations;
using GyrMonitor.Mobile.Core.Features.Observations.Domain;
using GyrMonitor.Mobile.Core.Features.Sync;
using GyrMonitor.Mobile.Core.Features.Sync.Infrastructure;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Mobile.Core.Resources.Strings;
using GyrMonitor.Mobile.Core.Shared.Authorization;

namespace GyrMonitor.Mobile.Core.Features.Sync.Application;

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
            return new MobileSyncSummary(0, 0, 0, AppStrings.NoSupportedSessionActive);
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

        var request = SyncObservationsMapper.ToRequestDto(_clientId, itemsByLocalId.Values.Select(pair => pair.Observation));
        var idempotencyKey = SyncIdempotency.ComputeKey(itemsByLocalId.Values.Select(pair => pair.Observation.ObservationId));

        try
        {
            var result = await _syncApi.SyncAsync(request, idempotencyKey);
            var outcomes = SyncObservationsMapper.ToOutcomes(result);
            return await ApplyOutcomesAsync(outcomes, itemsByLocalId);
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

    private async Task<MobileSyncSummary> ApplyOutcomesAsync(
        IReadOnlyDictionary<string, SyncItemOutcome> outcomes,
        Dictionary<string, (SyncQueueItem Queue, PendingObservation Observation)> itemsByLocalId)
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

            var (queueItem, observation) = pair;

            if (outcome.Kind == SyncItemOutcomeKind.Failed)
            {
                queueItem.Status = SyncStatuses.Failed;
                queueItem.RetryCount += 1;
                queueItem.LastError = outcome.Message;
                observation.SyncStatus = SyncStatuses.Failed;
                failed += 1;
            }
            else
            {
                queueItem.Status = SyncStatuses.Synced;
                queueItem.ServerId = outcome.ServerId;
                queueItem.LastError = null;
                observation.SyncStatus = SyncStatuses.Synced;
                observation.ServerId = outcome.ServerId;

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
