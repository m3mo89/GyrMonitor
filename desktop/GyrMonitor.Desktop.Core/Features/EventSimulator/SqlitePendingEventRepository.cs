using GyrMonitor.Desktop.Core.Shared.Storage;
using SQLite;

namespace GyrMonitor.Desktop.Core.Features.EventSimulator;

public sealed class SqlitePendingEventRepository : IPendingEventRepository
{
    private readonly ISqliteConnectionProvider _connectionProvider;
    private bool _initialized;

    public SqlitePendingEventRepository(ISqliteConnectionProvider connectionProvider)
    {
        _connectionProvider = connectionProvider;
    }

    public async Task AddAsync(PendingEvent pendingEvent)
    {
        var connection = await GetInitializedConnectionAsync();
        await connection.InsertAsync(pendingEvent);
    }

    public async Task<PendingEvent?> GetByLocalIdAsync(string localId)
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<PendingEvent>().Where(e => e.LocalId == localId).FirstOrDefaultAsync();
    }

    public async Task UpdateAsync(PendingEvent pendingEvent)
    {
        var connection = await GetInitializedConnectionAsync();
        await connection.UpdateAsync(pendingEvent);
    }

    public async Task<IReadOnlyList<PendingEvent>> GetAllAsync()
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<PendingEvent>().OrderByDescending(e => e.CapturedAt).ToListAsync();
    }

    private async Task<SQLiteAsyncConnection> GetInitializedConnectionAsync()
    {
        var connection = _connectionProvider.GetConnection();
        if (!_initialized)
        {
            await connection.CreateTableAsync<PendingEvent>();
            _initialized = true;
        }

        return connection;
    }
}
