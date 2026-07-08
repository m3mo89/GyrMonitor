namespace GyrMonitor.Client.Core.Networking;

public sealed class ApiEnvironmentService : IApiEnvironmentService
{
    private static readonly IReadOnlyList<ApiEnvironment> AllEnvironments =
    [
        ApiEnvironment.Local,
        ApiEnvironment.Staging,
        ApiEnvironment.Production
    ];

    private readonly ApiOptions _options;
    private readonly IApiEnvironmentStore _store;
    private readonly string _localBaseUrl;
    private readonly ApiEnvironment _defaultEnvironment;

    public ApiEnvironmentService(ApiOptions options, IApiEnvironmentStore store, string localBaseUrl, ApiEnvironment defaultEnvironment)
    {
        _options = options;
        _store = store;
        _localBaseUrl = localBaseUrl;
        _defaultEnvironment = defaultEnvironment;

        CurrentEnvironment = defaultEnvironment;
        _options.BaseUrl = ResolveBaseUrl(defaultEnvironment);
    }

    public ApiEnvironment CurrentEnvironment { get; private set; }

    public IReadOnlyList<ApiEnvironment> AvailableEnvironments => AllEnvironments;

    public Task InitializeAsync() => ResolvePersistedOrDefaultAsync();

    public async Task SetEnvironmentAsync(ApiEnvironment environment)
    {
        CurrentEnvironment = environment;
        _options.BaseUrl = ResolveBaseUrl(environment);
        await _store.SetAsync(environment);
    }

    private async Task ResolvePersistedOrDefaultAsync()
    {
        var persisted = await _store.GetAsync();
        await SetEnvironmentAsync(persisted ?? _defaultEnvironment);
    }

    private string ResolveBaseUrl(ApiEnvironment environment) => environment switch
    {
        ApiEnvironment.Local => _localBaseUrl,
        ApiEnvironment.Staging => ApiEnvironmentCatalog.StagingBaseUrl,
        ApiEnvironment.Production => ApiEnvironmentCatalog.ProductionBaseUrl,
        _ => _localBaseUrl
    };
}
