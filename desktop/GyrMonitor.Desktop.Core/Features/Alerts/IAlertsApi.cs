namespace GyrMonitor.Desktop.Core.Features.Alerts;

public interface IAlertsApi
{
    Task<IReadOnlyList<AlertSummaryDto>> GetAlertsAsync();
}
