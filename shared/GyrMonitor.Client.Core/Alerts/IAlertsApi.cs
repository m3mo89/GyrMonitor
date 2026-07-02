namespace GyrMonitor.Client.Core.Alerts;

public interface IAlertsApi
{
    Task<IReadOnlyList<AlertSummaryDto>> GetAlertsAsync();
}
