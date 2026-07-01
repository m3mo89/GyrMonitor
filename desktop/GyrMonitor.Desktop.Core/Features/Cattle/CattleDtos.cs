using System.Text.Json.Serialization;

namespace GyrMonitor.Desktop.Core.Features.Cattle;

public sealed class CattleSummaryDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("tagNumber")]
    public string TagNumber { get; set; } = string.Empty;

    [JsonPropertyName("breed")]
    public string? Breed { get; set; }

    [JsonPropertyName("sex")]
    public string? Sex { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("lastRiskScore")]
    public double? LastRiskScore { get; set; }
}
