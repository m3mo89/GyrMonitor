using System.Net.Http.Headers;
using System.Net.Http.Json;
using GyrMonitor.Desktop.Core.Shared.Session;

namespace GyrMonitor.Desktop.Core.Shared.Networking;

public sealed class ApiRequestSender
{
    private readonly HttpClient _httpClient;
    private readonly ApiOptions _options;
    private readonly IAuthSession _authSession;

    public ApiRequestSender(HttpClient httpClient, ApiOptions options, IAuthSession authSession)
    {
        _httpClient = httpClient;
        _options = options;
        _authSession = authSession;
    }

    public async Task<TResponse> GetAsync<TResponse>(string path, IReadOnlyDictionary<string, string?>? query = null)
    {
        var url = BuildUrl(path, query);
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        await AttachAuthorizationAsync(request);
        return await SendAsync<TResponse>(request);
    }

    public async Task<TResponse> PostAsync<TRequest, TResponse>(string path, TRequest body, string? idempotencyKey = null)
    {
        var url = BuildUrl(path, null);
        using var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(body)
        };
        await AttachAuthorizationAsync(request);

        if (!string.IsNullOrWhiteSpace(idempotencyKey))
        {
            request.Headers.Add("Idempotency-Key", idempotencyKey);
        }

        return await SendAsync<TResponse>(request);
    }

    public async Task<TResponse> PostPublicAsync<TRequest, TResponse>(string path, TRequest body)
    {
        var url = BuildUrl(path, null);
        using var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(body)
        };
        return await SendAsync<TResponse>(request);
    }

    private async Task AttachAuthorizationAsync(HttpRequestMessage request)
    {
        var session = await _authSession.GetAsync();
        if (session is not null)
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", session.AccessToken);
        }
    }

    private async Task<TResponse> SendAsync<TResponse>(HttpRequestMessage request)
    {
        using var response = await _httpClient.SendAsync(request);

        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
        {
            await _authSession.ClearAsync();
            AuthenticationEvents.RaiseSessionExpired();
            throw new ApiException("UNAUTHORIZED", "Session expired or invalid.");
        }

        var envelope = await response.Content.ReadFromJsonAsync<ApiEnvelope<TResponse>>();

        if (envelope is null)
        {
            throw new ApiException("NETWORK_ERROR", "Empty response from server.");
        }

        if (!envelope.Success || envelope.Data is null)
        {
            var error = envelope.Error ?? new ApiErrorBody { Code = "UNKNOWN", Message = "Unexpected API error." };
            throw new ApiException(error.Code, error.Message);
        }

        return envelope.Data;
    }

    private string BuildUrl(string path, IReadOnlyDictionary<string, string?>? query)
    {
        var url = $"{_options.BaseUrl.TrimEnd('/')}/{path.TrimStart('/')}";

        if (query is null || query.Count == 0)
        {
            return url;
        }

        var pairs = query
            .Where(pair => !string.IsNullOrWhiteSpace(pair.Value))
            .Select(pair => $"{Uri.EscapeDataString(pair.Key)}={Uri.EscapeDataString(pair.Value!)}");

        var queryString = string.Join("&", pairs);
        return queryString.Length == 0 ? url : $"{url}?{queryString}";
    }
}
