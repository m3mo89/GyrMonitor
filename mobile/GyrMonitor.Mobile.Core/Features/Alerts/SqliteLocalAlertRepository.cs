using GyrMonitor.Mobile.Core.Shared.Storage;

namespace GyrMonitor.Mobile.Core.Features.Alerts;

public sealed class SqliteLocalAlertRepository : ILocalAlertRepository
{
    private readonly ISqliteConnectionProvider _connectionProvider;
    private bool _initialized;

    public SqliteLocalAlertRepository(ISqliteConnectionProvider connectionProvider)
    {
        _connectionProvider = connectionProvider;
    }

    public async Task ReplaceAllAsync(IReadOnlyList<LocalAlert> alerts)
    {
        var connection = await GetInitializedConnectionAsync();
        await connection.RunInTransactionAsync(sync =>
        {
            sync.DeleteAll<LocalAlert>();
            sync.InsertAll(alerts);
        });
    }

    public async Task<IReadOnlyList<LocalAlert>> GetAllAsync()
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<LocalAlert>().OrderByDescending(alert => alert.CreatedAt).ToListAsync();
    }

    public async Task<LocalAlert?> GetByIdAsync(string id)
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<LocalAlert>().Where(alert => alert.Id == id).FirstOrDefaultAsync();
    }

    private async Task<SQLite.SQLiteAsyncConnection> GetInitializedConnectionAsync()
    {
        var connection = _connectionProvider.GetConnection();
        if (!_initialized)
        {
            await connection.CreateTableAsync<LocalAlert>();
            _initialized = true;
        }

        return connection;
    }
}
