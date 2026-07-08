using GyrMonitor.Mobile.Core.Features.Observations.Domain;

namespace GyrMonitor.Mobile.Core.Features.Observations;

public interface IPendingObservationRepository
{
    Task AddAsync(PendingObservation observation);

    Task<IReadOnlyList<PendingObservation>> GetPendingAsync();

    Task<IReadOnlyList<PendingObservation>> GetPendingForUserAsync(string ownerUserId);

    Task<PendingObservation?> GetByLocalIdAsync(string localId);

    Task<PendingObservation?> GetByLocalIdForUserAsync(string localId, string ownerUserId);

    Task UpdateAsync(PendingObservation observation);

    Task<IReadOnlyList<PendingObservation>> GetAllAsync();

    Task<IReadOnlyList<PendingObservation>> GetAllForUserAsync(string ownerUserId);
}
