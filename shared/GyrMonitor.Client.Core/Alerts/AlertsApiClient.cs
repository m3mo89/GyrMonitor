using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Client.Core.Alerts;

public sealed class AlertsApiClient : IAlertsApi
{
    private readonly ApiRequestSender _sender;

    public AlertsApiClient(ApiRequestSender sender)
    {
        _sender = sender;
    }

    public async Task<IReadOnlyList<AlertSummaryDto>> GetAlertsAsync()
    {
        return await _sender.GetAsync<List<AlertSummaryDto>>("/api/v1/alerts");
    }
}
