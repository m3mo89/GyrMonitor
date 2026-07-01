using GyrMonitor.Desktop.Core.Shared.Session;

namespace GyrMonitor.Desktop.Core.Tests.Shared.Session;

public sealed class InMemoryKeyValueStore : ISecureKeyValueStore
{
    private readonly Dictionary<string, string> _values = new();

    public Task SetAsync(string key, string value)
    {
        _values[key] = value;
        return Task.CompletedTask;
    }

    public Task<string?> GetAsync(string key)
    {
        return Task.FromResult(_values.TryGetValue(key, out var value) ? value : null);
    }

    public Task RemoveAsync(string key)
    {
        _values.Remove(key);
        return Task.CompletedTask;
    }
}

public class SecureAuthSessionTests
{
    [Fact]
    public async Task SaveAndGet_RoundTripsSessionData()
    {
        var session = new SecureAuthSession(new InMemoryKeyValueStore());
        var data = new AuthSessionData("token-1", "user-1", "Jane Doe", "jane@example.com", "FIELD_OPERATOR");

        await session.SaveAsync(data);
        var loaded = await session.GetAsync();

        Assert.Equal(data, loaded);
    }

    [Fact]
    public async Task Get_ReturnsNull_WhenNoSessionStored()
    {
        var session = new SecureAuthSession(new InMemoryKeyValueStore());

        Assert.Null(await session.GetAsync());
    }

    [Fact]
    public async Task Clear_RemovesStoredSession()
    {
        var session = new SecureAuthSession(new InMemoryKeyValueStore());
        await session.SaveAsync(new AuthSessionData("token-1", "user-1", "Jane Doe", "jane@example.com", "FIELD_OPERATOR"));

        await session.ClearAsync();

        Assert.Null(await session.GetAsync());
    }
}
