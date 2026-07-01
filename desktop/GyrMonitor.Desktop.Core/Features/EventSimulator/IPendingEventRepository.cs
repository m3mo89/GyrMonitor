namespace GyrMonitor.Desktop.Core.Features.EventSimulator;

public interface IPendingEventRepository
{
    Task AddAsync(PendingEvent pendingEvent);

    Task<PendingEvent?> GetByLocalIdAsync(string localId);

    Task UpdateAsync(PendingEvent pendingEvent);

    Task<IReadOnlyList<PendingEvent>> GetAllAsync();
}
