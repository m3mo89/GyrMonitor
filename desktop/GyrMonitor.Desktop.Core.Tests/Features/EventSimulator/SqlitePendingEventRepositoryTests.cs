using GyrMonitor.Client.Core.Sync.Domain;
using GyrMonitor.Desktop.Core.Features.EventSimulator.Domain;
using GyrMonitor.Desktop.Core.Features.EventSimulator.Infrastructure;
using GyrMonitor.Client.Core.Storage;

namespace GyrMonitor.Desktop.Core.Tests.Features.EventSimulator;

public class SqlitePendingEventRepositoryTests : IDisposable
{
    private readonly string _databasePath;

    public SqlitePendingEventRepositoryTests()
    {
        _databasePath = Path.Combine(Path.GetTempPath(), $"gyrmonitor-desktop-events-{Guid.NewGuid():N}.db3");
    }

    public void Dispose()
    {
        if (File.Exists(_databasePath))
        {
            File.Delete(_databasePath);
        }
    }

    [Fact]
    public async Task AddAndGetByLocalId_PersistsSimulatorTaggedEvent()
    {
        var repository = new SqlitePendingEventRepository(new SqliteConnectionProvider(_databasePath));

        await repository.AddAsync(new PendingEvent
        {
            LocalId = "local-1",
            EventId = "22222222-2222-4222-8222-222222222222",
            CattleId = "cattle-1",
            EventType = SimulatedEventTypes.Inactivity,
            InactiveMinutes = 90,
            Confidence = 0.9,
            CapturedAt = "2026-06-30T01:00:00.000Z",
            Source = SimulatedEventSource.DesktopSimulator
        });

        var found = await repository.GetByLocalIdAsync("local-1");

        Assert.NotNull(found);
        Assert.Equal(SimulatedEventSource.DesktopSimulator, found!.Source);
        Assert.Equal(SyncStatuses.Pending, found.SyncStatus);
    }

    [Fact]
    public async Task Data_SurvivesReopeningTheConnection()
    {
        var repository = new SqlitePendingEventRepository(new SqliteConnectionProvider(_databasePath));
        await repository.AddAsync(new PendingEvent { LocalId = "local-1", EventId = "evt-1", CattleId = "cattle-1", EventType = SimulatedEventTypes.Activity, Confidence = 0.5, CapturedAt = "t" });

        var reopened = new SqlitePendingEventRepository(new SqliteConnectionProvider(_databasePath));
        var all = await reopened.GetAllAsync();

        Assert.Single(all);
    }
}
