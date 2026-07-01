namespace GyrMonitor.Mobile.Core.Features.Alerts;

public interface ILocalAlertRepository
{
    Task ReplaceAllAsync(IReadOnlyList<LocalAlert> alerts);

    Task<IReadOnlyList<LocalAlert>> GetAllAsync();

    Task<LocalAlert?> GetByIdAsync(string id);
}
