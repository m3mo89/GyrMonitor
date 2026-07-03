using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Desktop.Core.Tests.Features.Sync;

public sealed class FakeConnectivityService : IConnectivityService
{
    public bool IsConnected { get; private set; } = true;

    public event EventHandler? ConnectivityRestored;

    public event EventHandler<bool>? ConnectivityChanged;

    public void SetConnected(bool isConnected)
    {
        IsConnected = isConnected;

        ConnectivityChanged?.Invoke(this, isConnected);

        if (isConnected)
        {
            ConnectivityRestored?.Invoke(this, EventArgs.Empty);
        }
    }
}
