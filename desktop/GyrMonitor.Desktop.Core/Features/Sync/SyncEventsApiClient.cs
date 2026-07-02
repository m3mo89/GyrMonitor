using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Desktop.Core.Features.Sync;

public sealed class SyncEventsApiClient : ISyncEventsApi
{
    private readonly ApiRequestSender _sender;

    public SyncEventsApiClient(ApiRequestSender sender)
    {
        _sender = sender;
    }

    public Task<SyncEventsResultDto> SyncAsync(SyncEventsRequestDto request, string idempotencyKey)
    {
        return _sender.PostAsync<SyncEventsRequestDto, SyncEventsResultDto>("/api/v1/sync/events", request, idempotencyKey);
    }
}
