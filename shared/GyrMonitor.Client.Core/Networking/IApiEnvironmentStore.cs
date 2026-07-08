namespace GyrMonitor.Client.Core.Networking;

public interface IApiEnvironmentStore
{
    Task<ApiEnvironment?> GetAsync();

    Task SetAsync(ApiEnvironment environment);
}
