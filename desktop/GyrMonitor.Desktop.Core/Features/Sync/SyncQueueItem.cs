using SQLite;

namespace GyrMonitor.Desktop.Core.Features.Sync;

public static class SyncEntityTypes
{
    public const string Observation = "OBSERVATION";
    public const string Event = "EVENT";
}

public static class SyncOperations
{
    public const string Create = "CREATE";
}

[Table("sync_queue")]
public sealed class SyncQueueItem
{
    [PrimaryKey]
    public string LocalId { get; set; } = string.Empty;

    public string EntityType { get; set; } = string.Empty;

    public string EntityLocalId { get; set; } = string.Empty;

    public string Operation { get; set; } = SyncOperations.Create;

    public string Status { get; set; } = SyncStatuses.Pending;

    public int RetryCount { get; set; }

    public string CreatedAt { get; set; } = string.Empty;

    public string? ServerId { get; set; }

    public string? LastError { get; set; }
}
