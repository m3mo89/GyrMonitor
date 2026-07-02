using System.Text.Json.Serialization;

namespace GyrMonitor.Client.Core.Networking;

public sealed class ApiEnvelope<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public T? Data { get; set; }

    [JsonPropertyName("error")]
    public ApiErrorBody? Error { get; set; }
}

public sealed class ApiErrorBody
{
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
}

public sealed class ApiException : Exception
{
    public string Code { get; }

    public ApiException(string code, string message) : base(message)
    {
        Code = code;
    }
}
