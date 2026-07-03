using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Desktop.Shared.Networking;

public sealed class MauiConnectivityService : IConnectivityService
{
    public event EventHandler? ConnectivityRestored;

    public event EventHandler<bool>? ConnectivityChanged;

    public MauiConnectivityService()
    {
        Connectivity.Current.ConnectivityChanged += OnConnectivityChanged;
    }

    public bool IsConnected => Connectivity.Current.NetworkAccess == NetworkAccess.Internet;

    private void OnConnectivityChanged(object? sender, ConnectivityChangedEventArgs e)
    {
        var isConnected = e.NetworkAccess == NetworkAccess.Internet;

        ConnectivityChanged?.Invoke(this, isConnected);

        if (isConnected)
        {
            ConnectivityRestored?.Invoke(this, EventArgs.Empty);
        }
    }
}
