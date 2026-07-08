using GyrMonitor.Client.Core.Session;
using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Client.Core.Sync.Domain;
using GyrMonitor.Mobile.Core.Features.Observations;
using GyrMonitor.Mobile.Core.Features.Observations.Domain;
using GyrMonitor.Mobile.Core.Features.Sync;
using GyrMonitor.Mobile.Core.Shared.Authorization;

namespace GyrMonitor.Mobile.Core.Features.Observations.Application;

public enum ObservationSaveResult
{
    Saved,
    SessionNotSupported
}

public sealed class ObservationCaptureService
{
    private readonly IPendingObservationRepository _observations;
    private readonly IMobileSyncQueueRepository _syncQueue;
    private readonly IAuthSession _authSession;
    private readonly string _clientId;

    public ObservationCaptureService(IPendingObservationRepository observations, IMobileSyncQueueRepository syncQueue, IAuthSession authSession, string clientId)
    {
        _observations = observations;
        _syncQueue = syncQueue;
        _authSession = authSession;
        _clientId = clientId;
    }

    public async Task<ObservationSaveResult> SaveAsync(string alertId, string comment)
    {
        var session = await _authSession.GetAsync();
        if (session is null || !MobileRoleAccess.IsSupported(session.Role))
        {
            return ObservationSaveResult.SessionNotSupported;
        }

        var now = DateTime.UtcNow.ToString("O");
        var observation = new PendingObservation
        {
            LocalId = Guid.NewGuid().ToString(),
            ObservationId = Guid.NewGuid().ToString(),
            AlertId = alertId,
            Comment = comment.Trim(),
            CreatedAt = now,
            ClientId = _clientId,
            OwnerUserId = session.UserId,
            SyncStatus = SyncStatuses.Pending
        };

        await _observations.AddAsync(observation);

        await _syncQueue.AddAsync(new SyncQueueItem
        {
            LocalId = Guid.NewGuid().ToString(),
            EntityType = SyncEntityTypes.Observation,
            EntityLocalId = observation.LocalId,
            Operation = SyncOperations.Create,
            Status = SyncStatuses.Pending,
            CreatedAt = now,
            OwnerUserId = session.UserId
        });

        return ObservationSaveResult.Saved;
    }
}
