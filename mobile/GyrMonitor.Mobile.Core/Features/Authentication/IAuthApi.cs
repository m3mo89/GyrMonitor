namespace GyrMonitor.Mobile.Core.Features.Authentication;

public interface IAuthApi
{
    Task<LoginResponseDataDto> LoginAsync(string email, string password);
}
