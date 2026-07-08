using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Tests.Session;

namespace GyrMonitor.Client.Core.Tests.Networking;

public class ApiEnvironmentServiceTests
{
    private const string LocalBaseUrl = "http://127.0.0.1:3000";

    private static ApiEnvironmentService CreateService(ApiOptions options, ApiEnvironment defaultEnvironment, ApiEnvironmentStore? store = null) =>
        new(options, store ?? new ApiEnvironmentStore(new InMemoryKeyValueStore()), LocalBaseUrl, defaultEnvironment);

    [Fact]
    public void Constructor_WithDebugDefault_ResolvesToLocal()
    {
        var options = new ApiOptions { BaseUrl = string.Empty };

        var service = CreateService(options, ApiEnvironment.Local);

        Assert.Equal(ApiEnvironment.Local, service.CurrentEnvironment);
        Assert.Equal(LocalBaseUrl, options.BaseUrl);
    }

    [Fact]
    public void Constructor_WithReleaseDefault_ResolvesToProduction()
    {
        var options = new ApiOptions { BaseUrl = string.Empty };

        var service = CreateService(options, ApiEnvironment.Production);

        Assert.Equal(ApiEnvironment.Production, service.CurrentEnvironment);
        Assert.Equal(ApiEnvironmentCatalog.ProductionBaseUrl, options.BaseUrl);
    }

    [Theory]
    [InlineData(ApiEnvironment.Staging, ApiEnvironmentCatalog.StagingBaseUrl)]
    [InlineData(ApiEnvironment.Production, ApiEnvironmentCatalog.ProductionBaseUrl)]
    public async Task SetEnvironmentAsync_UpdatesBaseUrlImmediately_AndPersists(ApiEnvironment environment, string expectedBaseUrl)
    {
        var options = new ApiOptions { BaseUrl = string.Empty };
        var store = new ApiEnvironmentStore(new InMemoryKeyValueStore());
        var service = CreateService(options, ApiEnvironment.Local, store);

        await service.SetEnvironmentAsync(environment);

        Assert.Equal(environment, service.CurrentEnvironment);
        Assert.Equal(expectedBaseUrl, options.BaseUrl);
        Assert.Equal(environment, await store.GetAsync());
    }

    [Theory]
    [InlineData(ApiEnvironment.Staging)]
    [InlineData(ApiEnvironment.Production)]
    public async Task InitializeAsync_RestoresPersistedEnvironment_RegardlessOfBuildDefault(ApiEnvironment persisted)
    {
        var store = new ApiEnvironmentStore(new InMemoryKeyValueStore());
        await store.SetAsync(persisted);

        var options = new ApiOptions { BaseUrl = string.Empty };
        var service = CreateService(options, ApiEnvironment.Local, store);

        await service.InitializeAsync();

        Assert.Equal(persisted, service.CurrentEnvironment);
    }

    [Fact]
    public async Task InitializeAsync_WithNothingPersisted_FallsBackToBuildDefault()
    {
        var options = new ApiOptions { BaseUrl = string.Empty };
        var service = CreateService(options, ApiEnvironment.Production);

        await service.InitializeAsync();

        Assert.Equal(ApiEnvironment.Production, service.CurrentEnvironment);
        Assert.Equal(ApiEnvironmentCatalog.ProductionBaseUrl, options.BaseUrl);
    }

    [Fact]
    public async Task InitializeAsync_WithCorruptPersistedValue_FallsBackToBuildDefault()
    {
        var keyValueStore = new InMemoryKeyValueStore();
        await keyValueStore.SetAsync("gyrmonitor.api-environment", "garbage");
        var store = new ApiEnvironmentStore(keyValueStore);

        var options = new ApiOptions { BaseUrl = string.Empty };
        var service = CreateService(options, ApiEnvironment.Local, store);

        await service.InitializeAsync();

        Assert.Equal(ApiEnvironment.Local, service.CurrentEnvironment);
        Assert.Equal(LocalBaseUrl, options.BaseUrl);
    }

    [Fact]
    public void AvailableEnvironments_AlwaysIncludesAllThree()
    {
        var options = new ApiOptions { BaseUrl = string.Empty };
        var service = CreateService(options, ApiEnvironment.Local);

        Assert.Equal(
            [ApiEnvironment.Local, ApiEnvironment.Staging, ApiEnvironment.Production],
            service.AvailableEnvironments);
    }

    [Theory]
    [InlineData(ApiEnvironmentCatalog.StagingBaseUrl)]
    [InlineData(ApiEnvironmentCatalog.ProductionBaseUrl)]
    public void CatalogUrls_HaveNoApiV1Suffix(string baseUrl)
    {
        Assert.DoesNotContain("/api/v1", baseUrl);
    }

    [Fact]
    public void ResolvedRequestUrl_DoesNotDoublePrefix()
    {
        const string path = "/api/v1/auth/login";
        var url = $"{ApiEnvironmentCatalog.StagingBaseUrl.TrimEnd('/')}/{path.TrimStart('/')}";

        Assert.Equal("https://gyrmonitor-staging.up.railway.app/api/v1/auth/login", url);
    }
}
