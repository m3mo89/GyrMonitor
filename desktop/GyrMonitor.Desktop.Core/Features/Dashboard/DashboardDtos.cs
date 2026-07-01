using System.Text.Json.Serialization;

namespace GyrMonitor.Desktop.Core.Features.Dashboard;

public sealed class RiskRankingItemDto
{
    [JsonPropertyName("cattleId")]
    public string CattleId { get; set; } = string.Empty;

    [JsonPropertyName("tagNumber")]
    public string TagNumber { get; set; } = string.Empty;

    [JsonPropertyName("riskScore")]
    public double RiskScore { get; set; }
}

public sealed class TrendItemDto
{
    [JsonPropertyName("date")]
    public string Date { get; set; } = string.Empty;

    [JsonPropertyName("events")]
    public int Events { get; set; }

    [JsonPropertyName("alerts")]
    public int Alerts { get; set; }
}

public sealed class DashboardMetricsDto
{
    [JsonPropertyName("totalCattle")]
    public int TotalCattle { get; set; }

    [JsonPropertyName("activeAlerts")]
    public int ActiveAlerts { get; set; }

    [JsonPropertyName("averageRiskScore")]
    public double AverageRiskScore { get; set; }

    [JsonPropertyName("highRiskCattle")]
    public int HighRiskCattle { get; set; }

    [JsonPropertyName("eventsToday")]
    public int EventsToday { get; set; }

    [JsonPropertyName("syncPendingCount")]
    public int SyncPendingCount { get; set; }

    [JsonPropertyName("riskRanking")]
    public List<RiskRankingItemDto> RiskRanking { get; set; } = new();

    [JsonPropertyName("trend")]
    public List<TrendItemDto> Trend { get; set; } = new();
}
