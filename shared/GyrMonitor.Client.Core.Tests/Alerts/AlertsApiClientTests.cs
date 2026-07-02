using System.Net;
using System.Net.Http.Json;
using GyrMonitor.Client.Core.Alerts;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Client.Core.Tests.Networking;

namespace GyrMonitor.Client.Core.Tests.Alerts;

public class AlertsApiClientTests
{
    [Fact]
    public async Task GetAlertsAsync_AttachesBearerTokenAndReturnsParsedAlerts()
    {
        HttpRequestMessage? capturedRequest = null;
        var handler = new StubHttpMessageHandler(request =>
        {
            capturedRequest = request;
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create(new ApiEnvelope<List<AlertSummaryDto>>
                {
                    Success = true,
                    Data = new List<AlertSummaryDto>
                    {
                        new() { Id = "alert-1", CattleId = "cattle-1", Severity = "HIGH", Status = "OPEN", CreatedAt = "2026-06-30T02:00:00.000Z" }
                    }
                })
            };
        });

        var sender = new ApiRequestSender(new HttpClient(handler), new ApiOptions { BaseUrl = "http://localhost:3000" }, new FixedAuthSession("token-123"));
        var client = new AlertsApiClient(sender);

        var alerts = await client.GetAlertsAsync();

        Assert.Single(alerts);
        Assert.Equal("alert-1", alerts[0].Id);
        Assert.Equal("token-123", capturedRequest!.Headers.Authorization!.Parameter);
    }

    private sealed class FixedAuthSession : IAuthSession
    {
        private readonly AuthSessionData _session;

        public FixedAuthSession(string accessToken)
        {
            _session = new AuthSessionData(accessToken, "user-1", "Jane", "jane@example.com", "FIELD_OPERATOR");
        }

        public Task SaveAsync(AuthSessionData session) => Task.CompletedTask;
        public Task<AuthSessionData?> GetAsync() => Task.FromResult<AuthSessionData?>(_session);
        public Task ClearAsync() => Task.CompletedTask;
    }
}
