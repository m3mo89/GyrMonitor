namespace GyrMonitor.Mobile.Core.Features.Alerts;

public interface IAlertsApi
{
    Task<IReadOnlyList<AlertSummaryDto>> GetAlertsAsync();
}
