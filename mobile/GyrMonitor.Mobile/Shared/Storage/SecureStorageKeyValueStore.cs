using GyrMonitor.Mobile.Core.Shared.Session;

namespace GyrMonitor.Mobile.Shared.Storage;

public sealed class SecureStorageKeyValueStore : ISecureKeyValueStore
{
    public Task SetAsync(string key, string value) => SecureStorage.Default.SetAsync(key, value);

    public Task<string?> GetAsync(string key) => SecureStorage.Default.GetAsync(key);

    public Task RemoveAsync(string key)
    {
        SecureStorage.Default.Remove(key);
        return Task.CompletedTask;
    }
}
