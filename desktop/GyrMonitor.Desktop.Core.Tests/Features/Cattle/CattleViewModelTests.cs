using GyrMonitor.Desktop.Core.Features.Cattle;
using Moq;

namespace GyrMonitor.Desktop.Core.Tests.Features.Cattle;

public class CattleViewModelTests
{
    [Fact]
    public async Task LoadAsync_PopulatesCattleFromBackend()
    {
        var api = new Mock<ICattleApi>();
        api.Setup(a => a.GetCattleAsync()).ReturnsAsync(new List<CattleSummaryDto>
        {
            new() { Id = "cattle-1", TagNumber = "GYR-023", Breed = "Gyr", Sex = "FEMALE", Status = "ACTIVE", LastRiskScore = 87.5 }
        });

        var viewModel = new CattleViewModel(api.Object);

        await viewModel.LoadCommand.ExecuteAsync(null);

        Assert.Single(viewModel.Cattle);
        Assert.Equal("GYR-023", viewModel.Cattle[0].TagNumber);
    }
}
