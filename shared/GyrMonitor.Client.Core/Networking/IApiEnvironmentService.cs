namespace GyrMonitor.Client.Core.Networking;

public interface IApiEnvironmentService
{
    ApiEnvironment CurrentEnvironment { get; }

    IReadOnlyList<ApiEnvironment> AvailableEnvironments { get; }

    Task InitializeAsync();

    Task SetEnvironmentAsync(ApiEnvironment environment);
}
