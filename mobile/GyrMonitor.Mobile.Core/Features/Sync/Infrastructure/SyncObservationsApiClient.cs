using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Mobile.Core.Features.Sync;

namespace GyrMonitor.Mobile.Core.Features.Sync.Infrastructure;

public sealed class SyncObservationsApiClient : ISyncObservationsApi
{
    private readonly ApiRequestSender _sender;

    public SyncObservationsApiClient(ApiRequestSender sender)
    {
        _sender = sender;
    }

    public Task<SyncObservationsResultDto> SyncAsync(SyncObservationsRequestDto request, string idempotencyKey)
    {
        return _sender.PostAsync<SyncObservationsRequestDto, SyncObservationsResultDto>("/api/v1/sync/observations", request, idempotencyKey);
    }
}
