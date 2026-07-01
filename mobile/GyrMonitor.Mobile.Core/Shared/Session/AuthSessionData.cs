namespace GyrMonitor.Mobile.Core.Shared.Session;

public sealed record AuthSessionData(string AccessToken, string UserId, string UserName, string Email, string Role);

public interface IAuthSession
{
    Task SaveAsync(AuthSessionData session);

    Task<AuthSessionData?> GetAsync();

    Task ClearAsync();
}

public interface ISecureKeyValueStore
{
    Task SetAsync(string key, string value);

    Task<string?> GetAsync(string key);

    Task RemoveAsync(string key);
}
