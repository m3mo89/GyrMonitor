using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Desktop.Core.Features.Authentication;

public sealed class AuthApiClient : IAuthApi
{
    private readonly ApiRequestSender _sender;

    public AuthApiClient(ApiRequestSender sender)
    {
        _sender = sender;
    }

    public Task<LoginResponseDataDto> LoginAsync(string email, string password)
    {
        var request = new LoginRequestDto { Email = email, Password = password };
        return _sender.PostPublicAsync<LoginRequestDto, LoginResponseDataDto>("/api/v1/auth/login", request);
    }
}
