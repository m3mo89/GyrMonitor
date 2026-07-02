using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Mobile.Core.Features.Sync;
using GyrMonitor.Client.Core.Storage;
using SQLite;

namespace GyrMonitor.Mobile.Core.Features.Observations;

public sealed class SqlitePendingObservationRepository : IPendingObservationRepository
{
    private readonly ISqliteConnectionProvider _connectionProvider;
    private bool _initialized;

    public SqlitePendingObservationRepository(ISqliteConnectionProvider connectionProvider)
    {
        _connectionProvider = connectionProvider;
    }

    public async Task AddAsync(PendingObservation observation)
    {
        var connection = await GetInitializedConnectionAsync();
        await connection.InsertAsync(observation);
    }

    public async Task<IReadOnlyList<PendingObservation>> GetPendingAsync()
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<PendingObservation>()
            .Where(observation => observation.SyncStatus == SyncStatuses.Pending || observation.SyncStatus == SyncStatuses.Failed)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<PendingObservation>> GetPendingForUserAsync(string ownerUserId)
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<PendingObservation>()
            .Where(observation => observation.OwnerUserId == ownerUserId && (observation.SyncStatus == SyncStatuses.Pending || observation.SyncStatus == SyncStatuses.Failed))
            .ToListAsync();
    }

    public async Task<PendingObservation?> GetByLocalIdAsync(string localId)
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<PendingObservation>().Where(observation => observation.LocalId == localId).FirstOrDefaultAsync();
    }

    public async Task<PendingObservation?> GetByLocalIdForUserAsync(string localId, string ownerUserId)
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<PendingObservation>().Where(observation => observation.LocalId == localId && observation.OwnerUserId == ownerUserId).FirstOrDefaultAsync();
    }

    public async Task UpdateAsync(PendingObservation observation)
    {
        var connection = await GetInitializedConnectionAsync();
        await connection.UpdateAsync(observation);
    }

    public async Task<IReadOnlyList<PendingObservation>> GetAllAsync()
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<PendingObservation>().OrderByDescending(observation => observation.CreatedAt).ToListAsync();
    }

    public async Task<IReadOnlyList<PendingObservation>> GetAllForUserAsync(string ownerUserId)
    {
        var connection = await GetInitializedConnectionAsync();
        return await connection.Table<PendingObservation>()
            .Where(observation => observation.OwnerUserId == ownerUserId)
            .OrderByDescending(observation => observation.CreatedAt)
            .ToListAsync();
    }

    private async Task<SQLiteAsyncConnection> GetInitializedConnectionAsync()
    {
        var connection = _connectionProvider.GetConnection();
        if (!_initialized)
        {
            await connection.CreateTableAsync<PendingObservation>();
            _initialized = true;
        }

        return connection;
    }
}
