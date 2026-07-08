using GyrMonitor.Client.Core.Storage;
using GyrMonitor.Mobile.Core.Features.Alerts;
using GyrMonitor.Mobile.Core.Features.Alerts.Domain;

namespace GyrMonitor.Mobile.Core.Features.Alerts.Infrastructure;

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

    public async Task ReplaceAllForUserAsync(string ownerUserId, IReadOnlyList<LocalAlert> alerts)
    {
        var connection = await GetInitializedConnectionAsync();
        await connection.RunInTransactionAsync(sync =>
        {
            foreach (var existing in sync.Table<LocalAlert>().Where(alert => alert.OwnerUserId == ownerUserId).ToList())
            {
                sync.Delete(existing);
            }

            foreach (var alert in alerts)
            {
                alert.OwnerUserId = ownerUserId;
                alert.LocalCacheId = BuildLocalCacheId(ownerUserId, alert.Id);
            }

            sync.InsertAll(alerts);
        });
    }

    public async Task<IReadOnlyList<LocalAlert>> GetAllAsync()
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<LocalAlert>().OrderByDescending(alert => alert.CreatedAt).ToListAsync();
    }

    public async Task<IReadOnlyList<LocalAlert>> GetAllForUserAsync(string ownerUserId)
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<LocalAlert>()
            .Where(alert => alert.OwnerUserId == ownerUserId)
            .OrderByDescending(alert => alert.CreatedAt)
            .ToListAsync();
    }

    public async Task<LocalAlert?> GetByIdAsync(string id)
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<LocalAlert>().Where(alert => alert.Id == id).FirstOrDefaultAsync();
    }

    public async Task<LocalAlert?> GetByIdForUserAsync(string id, string ownerUserId)
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<LocalAlert>().Where(alert => alert.Id == id && alert.OwnerUserId == ownerUserId).FirstOrDefaultAsync();
    }

    private static string BuildLocalCacheId(string ownerUserId, string alertId) => $"{ownerUserId}:{alertId}";

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
