using GyrMonitor.Client.Core.Sync.Domain;
using SQLite;

namespace GyrMonitor.Desktop.Core.Features.EventSimulator.Domain;

public static class SimulatedEventTypes
{
    public const string Activity = "ACTIVITY";
    public const string Inactivity = "INACTIVITY";
}

public static class SimulatedEventSource
{
    public const string DesktopSimulator = "DESKTOP_SIMULATOR";
}

[Table("pending_events")]
public sealed class PendingEvent
{
    [PrimaryKey]
    public string LocalId { get; set; } = string.Empty;

    public string EventId { get; set; } = string.Empty;

    public string CattleId { get; set; } = string.Empty;

    public string EventType { get; set; } = SimulatedEventTypes.Inactivity;

    public int? InactiveMinutes { get; set; }

    public double Confidence { get; set; }

    public string CapturedAt { get; set; } = string.Empty;

    public string Source { get; set; } = SimulatedEventSource.DesktopSimulator;

    public string SyncStatus { get; set; } = SyncStatuses.Pending;

    public string? ServerId { get; set; }
}
