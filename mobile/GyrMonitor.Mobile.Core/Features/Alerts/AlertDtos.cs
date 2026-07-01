using System.Text.Json.Serialization;

namespace GyrMonitor.Mobile.Core.Features.Alerts;

public sealed class AlertSummaryDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("cattleId")]
    public string CattleId { get; set; } = string.Empty;

    [JsonPropertyName("tagNumber")]
    public string? TagNumber { get; set; }

    [JsonPropertyName("severity")]
    public string Severity { get; set; } = string.Empty;

    [JsonPropertyName("riskScore")]
    public double? RiskScore { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("reason")]
    public string? Reason { get; set; }

    [JsonPropertyName("createdAt")]
    public string CreatedAt { get; set; } = string.Empty;
}
