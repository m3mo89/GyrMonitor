using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Client.Core.Storage;
using SQLite;

namespace GyrMonitor.Desktop.Core.Features.Sync;

public sealed class SqliteSyncQueueRepository : ISyncQueueRepository
{
    private readonly ISqliteConnectionProvider _connectionProvider;
    private bool _initialized;

    public SqliteSyncQueueRepository(ISqliteConnectionProvider connectionProvider)
    {
        _connectionProvider = connectionProvider;
    }

    public async Task AddAsync(SyncQueueItem item)
    {
        var connection = await GetInitializedConnectionAsync();
        await connection.InsertAsync(item);
    }

    public async Task<IReadOnlyList<SyncQueueItem>> GetPendingAsync()
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<SyncQueueItem>()
            .Where(item => item.Status == SyncStatuses.Pending || item.Status == SyncStatuses.Failed)
            .OrderBy(item => item.CreatedAt)
            .ToListAsync();
    }

    public async Task UpdateAsync(SyncQueueItem item)
    {
        var connection = await GetInitializedConnectionAsync();
        await connection.UpdateAsync(item);
    }

    public async Task<IReadOnlyList<SyncQueueItem>> GetAllAsync()
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<SyncQueueItem>().OrderByDescending(item => item.CreatedAt).ToListAsync();
    }

    private async Task<SQLiteAsyncConnection> GetInitializedConnectionAsync()
    {
        var connection = _connectionProvider.GetConnection();
        if (!_initialized)
        {
            await connection.CreateTableAsync<SyncQueueItem>();
            _initialized = true;
        }

        return connection;
    }
}
