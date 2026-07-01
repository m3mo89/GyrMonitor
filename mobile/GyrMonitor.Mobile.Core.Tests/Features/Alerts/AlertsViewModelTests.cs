using GyrMonitor.Mobile.Core.Features.Alerts;
using GyrMonitor.Mobile.Core.Shared.Networking;
using Moq;

namespace GyrMonitor.Mobile.Core.Tests.Features.Alerts;

public class AlertsViewModelTests
{
    private static AlertSummaryDto SampleAlert() => new()
    {
        Id = "alert-1",
        CattleId = "cattle-1",
        TagNumber = "GYR-023",
        Severity = "HIGH",
        RiskScore = 87.5,
        Status = "PENDING",
        Reason = "Inactividad prolongada",
        CreatedAt = "2026-06-20T12:40:00Z"
    };

    [Fact]
    public async Task LoadAsync_FetchesRemoteAlertsAndCachesThemWhenOnline()
    {
        var alertsApi = new Mock<IAlertsApi>();
        alertsApi.Setup(api => api.GetAlertsAsync()).ReturnsAsync(new List<AlertSummaryDto> { SampleAlert() });

        var localAlerts = new Mock<ILocalAlertRepository>();
        localAlerts.Setup(repo => repo.ReplaceAllAsync(It.IsAny<IReadOnlyList<LocalAlert>>())).Returns(Task.CompletedTask);

        var connectivity = new Mock<IConnectivityService>();
        connectivity.SetupGet(c => c.IsConnected).Returns(true);

        var viewModel = new AlertsViewModel(alertsApi.Object, localAlerts.Object, connectivity.Object);

        await viewModel.LoadCommand.ExecuteAsync(null);

        Assert.Single(viewModel.Alerts);
        Assert.Equal("alert-1", viewModel.Alerts[0].Id);
        Assert.False(viewModel.IsStale);
        localAlerts.Verify(repo => repo.ReplaceAllAsync(It.Is<IReadOnlyList<LocalAlert>>(list => list.Count == 1)), Times.Once);
    }

    [Fact]
    public async Task LoadAsync_UsesCacheAndMarksStale_WhenOffline()
    {
        var alertsApi = new Mock<IAlertsApi>();
        var localAlerts = new Mock<ILocalAlertRepository>();
        localAlerts
            .Setup(repo => repo.GetAllAsync())
            .ReturnsAsync(new List<LocalAlert> { new() { Id = "alert-1", CattleId = "cattle-1", Severity = "HIGH", Status = "PENDING", CreatedAt = "2026-06-20T12:40:00Z", CachedAt = "2026-06-20T13:00:00Z" } });

        var connectivity = new Mock<IConnectivityService>();
        connectivity.SetupGet(c => c.IsConnected).Returns(false);

        var viewModel = new AlertsViewModel(alertsApi.Object, localAlerts.Object, connectivity.Object);

        await viewModel.LoadCommand.ExecuteAsync(null);

        Assert.Single(viewModel.Alerts);
        Assert.True(viewModel.IsStale);
        alertsApi.Verify(api => api.GetAlertsAsync(), Times.Never);
    }

    [Fact]
    public async Task LoadAsync_FallsBackToCache_WhenRemoteCallFails()
    {
        var alertsApi = new Mock<IAlertsApi>();
        alertsApi.Setup(api => api.GetAlertsAsync()).ThrowsAsync(new ApiException("INTERNAL_ERROR", "boom"));

        var localAlerts = new Mock<ILocalAlertRepository>();
        localAlerts
            .Setup(repo => repo.GetAllAsync())
            .ReturnsAsync(new List<LocalAlert> { new() { Id = "alert-1", CattleId = "cattle-1", Severity = "HIGH", Status = "PENDING", CreatedAt = "2026-06-20T12:40:00Z", CachedAt = "2026-06-20T13:00:00Z" } });

        var connectivity = new Mock<IConnectivityService>();
        connectivity.SetupGet(c => c.IsConnected).Returns(true);

        var viewModel = new AlertsViewModel(alertsApi.Object, localAlerts.Object, connectivity.Object);

        await viewModel.LoadCommand.ExecuteAsync(null);

        Assert.Single(viewModel.Alerts);
        Assert.True(viewModel.IsStale);
        Assert.NotNull(viewModel.ErrorMessage);
    }
}
