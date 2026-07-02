using GyrMonitor.Desktop.Core.Features.Dashboard;
using GyrMonitor.Client.Core.Networking;
using Moq;

namespace GyrMonitor.Desktop.Core.Tests.Features.Dashboard;

public class DashboardViewModelTests
{
    [Fact]
    public async Task LoadAsync_PopulatesMetricsFromBackend()
    {
        var api = new Mock<IDashboardApi>();
        api.Setup(a => a.GetDashboardAsync()).ReturnsAsync(new DashboardMetricsDto
        {
            TotalCattle = 100,
            ActiveAlerts = 7,
            AverageRiskScore = 42.5,
            HighRiskCattle = 3,
            EventsToday = 12,
            SyncPendingCount = 2,
            RiskRanking = new List<RiskRankingItemDto> { new() { CattleId = "cattle-1", TagNumber = "GYR-023", RiskScore = 87.5 } },
            Trend = new List<TrendItemDto> { new() { Date = "2026-06-20", Events = 12, Alerts = 1 } }
        });

        var viewModel = new DashboardViewModel(api.Object);

        await viewModel.LoadCommand.ExecuteAsync(null);

        Assert.NotNull(viewModel.Metrics);
        Assert.Equal(100, viewModel.Metrics!.TotalCattle);
        Assert.Single(viewModel.Metrics.RiskRanking);
        Assert.Null(viewModel.ErrorMessage);
    }

    [Fact]
    public async Task LoadAsync_SetsErrorMessage_OnApiFailure()
    {
        var api = new Mock<IDashboardApi>();
        api.Setup(a => a.GetDashboardAsync()).ThrowsAsync(new ApiException("FORBIDDEN", "Not allowed"));

        var viewModel = new DashboardViewModel(api.Object);

        await viewModel.LoadCommand.ExecuteAsync(null);

        Assert.Equal("Not allowed", viewModel.ErrorMessage);
        Assert.Null(viewModel.Metrics);
    }
}
