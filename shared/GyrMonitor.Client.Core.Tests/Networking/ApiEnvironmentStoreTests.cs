using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Tests.Session;

namespace GyrMonitor.Client.Core.Tests.Networking;

public class ApiEnvironmentStoreTests
{
    [Fact]
    public async Task GetAsync_ReturnsNull_WhenNothingPersisted()
    {
        var store = new ApiEnvironmentStore(new InMemoryKeyValueStore());

        Assert.Null(await store.GetAsync());
    }

    [Theory]
    [InlineData(ApiEnvironment.Local)]
    [InlineData(ApiEnvironment.Staging)]
    [InlineData(ApiEnvironment.Production)]
    public async Task SetAndGet_RoundTripsEnvironment(ApiEnvironment environment)
    {
        var store = new ApiEnvironmentStore(new InMemoryKeyValueStore());

        await store.SetAsync(environment);

        Assert.Equal(environment, await store.GetAsync());
    }

    [Fact]
    public async Task GetAsync_ReturnsNull_ForCorruptOrUnknownValue()
    {
        var keyValueStore = new InMemoryKeyValueStore();
        await keyValueStore.SetAsync("gyrmonitor.api-environment", "not-a-real-environment");
        var store = new ApiEnvironmentStore(keyValueStore);

        Assert.Null(await store.GetAsync());
    }
}
