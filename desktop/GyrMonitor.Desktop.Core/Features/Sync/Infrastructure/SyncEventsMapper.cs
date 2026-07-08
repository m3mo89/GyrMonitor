using GyrMonitor.Desktop.Core.Features.EventSimulator.Domain;
using GyrMonitor.Desktop.Core.Features.Sync;

namespace GyrMonitor.Desktop.Core.Features.Sync.Infrastructure;

public static class SyncEventsMapper
{
    public static SyncEventsRequestDto ToRequestDto(string? clientId, string? deviceId, IEnumerable<PendingEvent> events)
    {
        return new SyncEventsRequestDto
        {
            ClientId = clientId,
            DeviceId = deviceId,
            Items = events
                .Select(pendingEvent => new SyncEventItemRequestDto
                {
                    LocalId = pendingEvent.LocalId,
                    EventId = pendingEvent.EventId,
                    CattleId = pendingEvent.CattleId,
                    EventType = pendingEvent.EventType,
                    InactiveMinutes = pendingEvent.InactiveMinutes,
                    Confidence = pendingEvent.Confidence,
                    CapturedAt = pendingEvent.CapturedAt,
                    Source = pendingEvent.Source
                })
                .ToList()
        };
    }

    public static IReadOnlyDictionary<string, SyncItemOutcome> ToOutcomes(SyncEventsResultDto result)
    {
        return result.Results.ToDictionary(
            item => item.LocalId,
            item => new SyncItemOutcome(ToKind(item.Status), item.ServerId, item.Message));
    }

    private static SyncItemOutcomeKind ToKind(string status) => status switch
    {
        "FAILED" => SyncItemOutcomeKind.Failed,
        "DUPLICATE" => SyncItemOutcomeKind.Duplicate,
        _ => SyncItemOutcomeKind.Synced
    };
}
