namespace GyrMonitor.Mobile.Core.Features.Alerts;

public interface ILocalAlertRepository
{
    Task ReplaceAllAsync(IReadOnlyList<LocalAlert> alerts);

    Task ReplaceAllForUserAsync(string ownerUserId, IReadOnlyList<LocalAlert> alerts);

    Task<IReadOnlyList<LocalAlert>> GetAllAsync();

    Task<IReadOnlyList<LocalAlert>> GetAllForUserAsync(string ownerUserId);

    Task<LocalAlert?> GetByIdAsync(string id);

    Task<LocalAlert?> GetByIdForUserAsync(string id, string ownerUserId);
}
