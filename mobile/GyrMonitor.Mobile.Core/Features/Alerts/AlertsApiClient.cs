using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Mobile.Core.Features.Alerts;

public sealed class AlertsApiClient : IAlertsApi
{
    private readonly ApiRequestSender _sender;

    public AlertsApiClient(ApiRequestSender sender)
    {
        _sender = sender;
    }

    public async Task<IReadOnlyList<AlertSummaryDto>> GetAlertsAsync()
    {
        var result = await _sender.GetAsync<List<AlertSummaryDto>>("/api/v1/alerts");
        return result;
    }
}
