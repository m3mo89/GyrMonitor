namespace GyrMonitor.Client.Core.Authentication;

public interface IAuthApi
{
    Task<LoginResponseDataDto> LoginAsync(string email, string password);
}
