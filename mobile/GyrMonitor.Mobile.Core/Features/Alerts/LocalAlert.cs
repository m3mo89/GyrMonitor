using SQLite;

namespace GyrMonitor.Mobile.Core.Features.Alerts;

[Table("local_alerts")]
public sealed class LocalAlert
{
    [PrimaryKey]
    public string LocalCacheId { get; set; } = string.Empty;

    public string OwnerUserId { get; set; } = string.Empty;

    public string Id { get; set; } = string.Empty;

    public string CattleId { get; set; } = string.Empty;

    public string TagNumber { get; set; } = string.Empty;

    public string Severity { get; set; } = string.Empty;

    public double? RiskScore { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Reason { get; set; }

    public string CreatedAt { get; set; } = string.Empty;

    public string CachedAt { get; set; } = string.Empty;
}
