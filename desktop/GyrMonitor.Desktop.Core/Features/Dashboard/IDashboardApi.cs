namespace GyrMonitor.Desktop.Core.Features.Dashboard;

public interface IDashboardApi
{
    Task<DashboardMetricsDto> GetDashboardAsync();
}
