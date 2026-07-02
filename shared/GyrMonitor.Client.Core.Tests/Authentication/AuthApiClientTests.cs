using System.Net;
using System.Net.Http.Json;
using GyrMonitor.Client.Core.Authentication;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Client.Core.Tests.Networking;

namespace GyrMonitor.Client.Core.Tests.Authentication;

public class AuthApiClientTests
{
    [Fact]
    public async Task LoginAsync_PostsCredentialsAndReturnsUser_OnSuccess()
    {
        HttpRequestMessage? capturedRequest = null;
        var handler = new StubHttpMessageHandler(request =>
        {
            capturedRequest = request;
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create(new ApiEnvelope<LoginResponseDataDto>
                {
                    Success = true,
                    Data = new LoginResponseDataDto
                    {
                        AccessToken = "token-123",
                        ExpiresIn = 3600,
                        User = new AuthenticatedUserDto { Id = "user-1", Name = "Jane", Email = "jane@example.com", Role = "FIELD_OPERATOR" }
                    }
                })
            };
        });

        var sender = new ApiRequestSender(new HttpClient(handler), new ApiOptions { BaseUrl = "http://localhost:3000" }, new NoSessionAuthSession());
        var client = new AuthApiClient(sender);

        var result = await client.LoginAsync("jane@example.com", "secret");

        Assert.Equal("token-123", result.AccessToken);
        Assert.Equal("FIELD_OPERATOR", result.User.Role);
        Assert.NotNull(capturedRequest);
        Assert.Equal("http://localhost:3000/api/v1/auth/login", capturedRequest!.RequestUri!.ToString());
        Assert.Equal(HttpMethod.Post, capturedRequest.Method);
    }

    [Fact]
    public async Task LoginAsync_ThrowsApiException_WhenCredentialsAreInvalid()
    {
        var handler = new StubHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = JsonContent.Create(new ApiEnvelope<LoginResponseDataDto>
            {
                Success = false,
                Error = new ApiErrorBody { Code = "UNAUTHORIZED", Message = "Invalid email or password." }
            })
        });

        var sender = new ApiRequestSender(new HttpClient(handler), new ApiOptions { BaseUrl = "http://localhost:3000" }, new NoSessionAuthSession());
        var client = new AuthApiClient(sender);

        var ex = await Assert.ThrowsAsync<ApiException>(() => client.LoginAsync("jane@example.com", "wrong"));
        Assert.Equal("UNAUTHORIZED", ex.Code);
    }

    private sealed class NoSessionAuthSession : IAuthSession
    {
        public Task SaveAsync(AuthSessionData session) => Task.CompletedTask;
        public Task<AuthSessionData?> GetAsync() => Task.FromResult<AuthSessionData?>(null);
        public Task ClearAsync() => Task.CompletedTask;
    }
}
