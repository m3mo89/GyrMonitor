namespace GyrMonitor.Desktop.Core.Features.Sync;

public enum SyncItemOutcomeKind
{
    Synced,
    Duplicate,
    Failed
}

public sealed record SyncItemOutcome(SyncItemOutcomeKind Kind, string? ServerId, string? Message);
