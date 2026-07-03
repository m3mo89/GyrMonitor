namespace GyrMonitor.Desktop.Core.Tests.Features.Sync;

public class FakeConnectivityServiceTests
{
    [Fact]
    public void SetConnected_False_RaisesConnectivityChangedOnly()
    {
        var service = new FakeConnectivityService();
        var changedRaisedWith = new List<bool>();
        var restoredRaised = false;

        service.ConnectivityChanged += (_, isConnected) => changedRaisedWith.Add(isConnected);
        service.ConnectivityRestored += (_, _) => restoredRaised = true;

        service.SetConnected(false);

        Assert.Equal(new[] { false }, changedRaisedWith);
        Assert.False(restoredRaised);
        Assert.False(service.IsConnected);
    }

    [Fact]
    public void SetConnected_True_RaisesConnectivityChangedAndConnectivityRestored()
    {
        var service = new FakeConnectivityService();
        var changedRaisedWith = new List<bool>();
        var restoredRaised = false;

        service.ConnectivityChanged += (_, isConnected) => changedRaisedWith.Add(isConnected);
        service.ConnectivityRestored += (_, _) => restoredRaised = true;

        service.SetConnected(false);
        service.SetConnected(true);

        Assert.Equal(new[] { false, true }, changedRaisedWith);
        Assert.True(restoredRaised);
        Assert.True(service.IsConnected);
    }
}
