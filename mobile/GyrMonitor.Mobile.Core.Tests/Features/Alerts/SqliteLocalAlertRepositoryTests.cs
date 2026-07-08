using GyrMonitor.Mobile.Core.Features.Alerts.Domain;
using GyrMonitor.Mobile.Core.Features.Alerts.Infrastructure;
using GyrMonitor.Client.Core.Storage;

namespace GyrMonitor.Mobile.Core.Tests.Features.Alerts;

public class SqliteLocalAlertRepositoryTests : IDisposable
{
    private readonly string _databasePath;

    public SqliteLocalAlertRepositoryTests()
    {
        _databasePath = Path.Combine(Path.GetTempPath(), $"gyrmonitor-mobile-alerts-{Guid.NewGuid():N}.db3");
    }

    public void Dispose()
    {
        if (File.Exists(_databasePath))
        {
            File.Delete(_databasePath);
        }
    }

    [Fact]
    public async Task ReplaceAllAndGetAll_RoundTripsCachedAlerts()
    {
        var repository = new SqliteLocalAlertRepository(new SqliteConnectionProvider(_databasePath));

        await repository.ReplaceAllForUserAsync("user-1", new List<LocalAlert>
        {
            new() { Id = "alert-1", CattleId = "cattle-1", TagNumber = "GYR-023", Severity = "HIGH", Status = "PENDING", CreatedAt = "2026-06-20T12:40:00Z", CachedAt = "2026-06-20T13:00:00Z" }
        });

        var all = await repository.GetAllForUserAsync("user-1");
        Assert.Single(all);
        Assert.Equal("alert-1", all[0].Id);

        var single = await repository.GetByIdForUserAsync("alert-1", "user-1");
        Assert.NotNull(single);
        Assert.Equal("GYR-023", single!.TagNumber);
    }

    [Fact]
    public async Task Cache_SurvivesReopeningTheConnection()
    {
        var repository = new SqliteLocalAlertRepository(new SqliteConnectionProvider(_databasePath));
        await repository.ReplaceAllForUserAsync("user-1", new List<LocalAlert>
        {
            new() { Id = "alert-1", CattleId = "cattle-1", Severity = "HIGH", Status = "PENDING", CreatedAt = "2026-06-20T12:40:00Z", CachedAt = "2026-06-20T13:00:00Z" }
        });

        var reopened = new SqliteLocalAlertRepository(new SqliteConnectionProvider(_databasePath));
        var all = await reopened.GetAllForUserAsync("user-1");

        Assert.Single(all);
    }

    [Fact]
    public async Task ReplaceAllAsync_ClearsPreviousCache()
    {
        var repository = new SqliteLocalAlertRepository(new SqliteConnectionProvider(_databasePath));
        await repository.ReplaceAllForUserAsync("user-1", new List<LocalAlert> { new() { Id = "alert-1", CattleId = "cattle-1", Severity = "HIGH", Status = "PENDING", CreatedAt = "t", CachedAt = "t" } });
        await repository.ReplaceAllForUserAsync("user-1", new List<LocalAlert> { new() { Id = "alert-2", CattleId = "cattle-2", Severity = "LOW", Status = "PENDING", CreatedAt = "t", CachedAt = "t" } });

        var all = await repository.GetAllForUserAsync("user-1");

        Assert.Single(all);
        Assert.Equal("alert-2", all[0].Id);
    }

    [Fact]
    public async Task GetAllForUserAsync_ExcludesOtherUsersCache()
    {
        var repository = new SqliteLocalAlertRepository(new SqliteConnectionProvider(_databasePath));
        await repository.ReplaceAllForUserAsync("user-1", new List<LocalAlert> { new() { Id = "alert-1", CattleId = "cattle-1", Severity = "HIGH", Status = "PENDING", CreatedAt = "t", CachedAt = "t" } });
        await repository.ReplaceAllForUserAsync("user-2", new List<LocalAlert> { new() { Id = "alert-2", CattleId = "cattle-2", Severity = "LOW", Status = "PENDING", CreatedAt = "t", CachedAt = "t" } });

        var all = await repository.GetAllForUserAsync("user-1");

        Assert.Single(all);
        Assert.Equal("alert-1", all[0].Id);
    }
}
