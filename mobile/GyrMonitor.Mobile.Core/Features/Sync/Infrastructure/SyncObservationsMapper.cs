using GyrMonitor.Mobile.Core.Features.Observations.Domain;
using GyrMonitor.Mobile.Core.Features.Sync;

namespace GyrMonitor.Mobile.Core.Features.Sync.Infrastructure;

public static class SyncObservationsMapper
{
    public static SyncObservationsRequestDto ToRequestDto(string? clientId, IEnumerable<PendingObservation> observations)
    {
        return new SyncObservationsRequestDto
        {
            ClientId = clientId,
            Items = observations
                .Select(observation => new SyncObservationItemRequestDto
                {
                    LocalId = observation.LocalId,
                    ObservationId = observation.ObservationId,
                    AlertId = observation.AlertId,
                    Comment = observation.Comment,
                    CreatedAt = observation.CreatedAt,
                    ClientId = observation.ClientId
                })
                .ToList()
        };
    }

    public static IReadOnlyDictionary<string, SyncItemOutcome> ToOutcomes(SyncObservationsResultDto result)
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
