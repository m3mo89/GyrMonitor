using GyrMonitor.Mobile.Core.Shared.Networking;

namespace GyrMonitor.Mobile.Core.Features.Sync;

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
