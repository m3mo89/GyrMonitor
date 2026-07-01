namespace GyrMonitor.Mobile.Core.Features.Observations;

public interface IPendingObservationRepository
{
    Task AddAsync(PendingObservation observation);

    Task<IReadOnlyList<PendingObservation>> GetPendingAsync();

    Task<PendingObservation?> GetByLocalIdAsync(string localId);

    Task UpdateAsync(PendingObservation observation);

    Task<IReadOnlyList<PendingObservation>> GetAllAsync();
}
