namespace GyrMonitor.Desktop.Core.Features.Sync;

public interface ISyncEventsApi
{
    Task<SyncEventsResultDto> SyncAsync(SyncEventsRequestDto request, string idempotencyKey);
}
