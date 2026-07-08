using GyrMonitor.Client.Core.Session;

namespace GyrMonitor.Client.Core.Networking;

public sealed class ApiEnvironmentStore : IApiEnvironmentStore
{
    private const string EnvironmentKey = "gyrmonitor.api-environment";

    private readonly ISecureKeyValueStore _store;

    public ApiEnvironmentStore(ISecureKeyValueStore store)
    {
        _store = store;
    }

    public async Task<ApiEnvironment?> GetAsync()
    {
        var raw = await _store.GetAsync(EnvironmentKey);
        return Enum.TryParse<ApiEnvironment>(raw, out var environment) ? environment : null;
    }

    public Task SetAsync(ApiEnvironment environment) => _store.SetAsync(EnvironmentKey, environment.ToString());
}
