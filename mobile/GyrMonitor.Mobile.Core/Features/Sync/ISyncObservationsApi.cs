using GyrMonitor.Mobile.Core.Features.Sync.Infrastructure;

namespace GyrMonitor.Mobile.Core.Features.Sync;

public interface ISyncObservationsApi
{
    Task<SyncObservationsResultDto> SyncAsync(SyncObservationsRequestDto request, string idempotencyKey);
}
