using GyrMonitor.Mobile.Core.Features.Sync;
using SQLite;

namespace GyrMonitor.Mobile.Core.Features.Observations;

[Table("pending_observations")]
public sealed class PendingObservation
{
    [PrimaryKey]
    public string LocalId { get; set; } = string.Empty;

    public string ObservationId { get; set; } = string.Empty;

    public string AlertId { get; set; } = string.Empty;

    public string Comment { get; set; } = string.Empty;

    public string CreatedAt { get; set; } = string.Empty;

    public string? ClientId { get; set; }

    public string SyncStatus { get; set; } = SyncStatuses.Pending;

    public string? ServerId { get; set; }
}
