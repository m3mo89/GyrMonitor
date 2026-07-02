using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Desktop.Core.Features.Dashboard;

public sealed class DashboardApiClient : IDashboardApi
{
    private readonly ApiRequestSender _sender;

    public DashboardApiClient(ApiRequestSender sender)
    {
        _sender = sender;
    }

    public Task<DashboardMetricsDto> GetDashboardAsync() => _sender.GetAsync<DashboardMetricsDto>("/api/v1/dashboard");
}
