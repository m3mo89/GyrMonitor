using System.Text.Json.Serialization;

namespace GyrMonitor.Mobile.Core.Features.Sync.Infrastructure;

public sealed class SyncObservationItemRequestDto
{
    [JsonPropertyName("localId")]
    public string LocalId { get; set; } = string.Empty;

    [JsonPropertyName("observationId")]
    public string ObservationId { get; set; } = string.Empty;

    [JsonPropertyName("alertId")]
    public string AlertId { get; set; } = string.Empty;

    [JsonPropertyName("comment")]
    public string Comment { get; set; } = string.Empty;

    [JsonPropertyName("createdAt")]
    public string CreatedAt { get; set; } = string.Empty;

    [JsonPropertyName("clientId")]
    public string? ClientId { get; set; }
}

public sealed class SyncObservationsRequestDto
{
    [JsonPropertyName("clientId")]
    public string? ClientId { get; set; }

    [JsonPropertyName("items")]
    public List<SyncObservationItemRequestDto> Items { get; set; } = new();
}

public sealed class SyncObservationItemResultDto
{
    [JsonPropertyName("localId")]
    public string LocalId { get; set; } = string.Empty;

    [JsonPropertyName("observationId")]
    public string ObservationId { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("serverId")]
    public string? ServerId { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }
}

public sealed class SyncObservationsResultDto
{
    [JsonPropertyName("processed")]
    public int Processed { get; set; }

    [JsonPropertyName("created")]
    public int Created { get; set; }

    [JsonPropertyName("duplicates")]
    public int Duplicates { get; set; }

    [JsonPropertyName("failed")]
    public int Failed { get; set; }

    [JsonPropertyName("results")]
    public List<SyncObservationItemResultDto> Results { get; set; } = new();
}
