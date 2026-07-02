using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Desktop.Core.Features.Cattle;

public sealed class CattleApiClient : ICattleApi
{
    private readonly ApiRequestSender _sender;

    public CattleApiClient(ApiRequestSender sender)
    {
        _sender = sender;
    }

    public async Task<IReadOnlyList<CattleSummaryDto>> GetCattleAsync()
    {
        return await _sender.GetAsync<List<CattleSummaryDto>>("/api/v1/cattle");
    }
}
