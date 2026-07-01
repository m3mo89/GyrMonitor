using System.Text.Json;

namespace GyrMonitor.Mobile.Core.Shared.Session;

public sealed class SecureAuthSession : IAuthSession
{
    private const string SessionKey = "gyrmonitor.session";

    private readonly ISecureKeyValueStore _store;

    public SecureAuthSession(ISecureKeyValueStore store)
    {
        _store = store;
    }

    public async Task SaveAsync(AuthSessionData session)
    {
        var json = JsonSerializer.Serialize(session);
        await _store.SetAsync(SessionKey, json);
    }

    public async Task<AuthSessionData?> GetAsync()
    {
        var json = await _store.GetAsync(SessionKey);
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<AuthSessionData>(json);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public Task ClearAsync() => _store.RemoveAsync(SessionKey);
}
