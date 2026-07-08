using GyrMonitor.Desktop.Core.Features.Sync.Presentation;

namespace GyrMonitor.Desktop.Core.Tests.Features.Sync;

public class ConnectivityStatusViewModelTests
{
    [Fact]
    public void IsOffline_ReflectsInitialConnectivityState()
    {
        var connectivity = new FakeConnectivityService();
        connectivity.SetConnected(true);

        var viewModel = new ConnectivityStatusViewModel(connectivity);

        Assert.False(viewModel.IsOffline);
    }

    [Fact]
    public void IsOffline_UpdatesWhenConnectivityChanges_WithoutNeedingReconstruction()
    {
        var connectivity = new FakeConnectivityService();
        connectivity.SetConnected(true);
        var viewModel = new ConnectivityStatusViewModel(connectivity);

        connectivity.SetConnected(false);
        Assert.True(viewModel.IsOffline);

        connectivity.SetConnected(true);
        Assert.False(viewModel.IsOffline);
    }
}
