using GyrMonitor.Mobile.Core.Shared.Networking;

namespace GyrMonitor.Mobile.Shared.Networking;

public sealed class MauiConnectivityService : IConnectivityService
{
    public event EventHandler? ConnectivityRestored;

    public MauiConnectivityService()
    {
        Connectivity.Current.ConnectivityChanged += OnConnectivityChanged;
    }

    public bool IsConnected => Connectivity.Current.NetworkAccess == NetworkAccess.Internet;

    private void OnConnectivityChanged(object? sender, ConnectivityChangedEventArgs e)
    {
        if (e.NetworkAccess == NetworkAccess.Internet)
        {
            ConnectivityRestored?.Invoke(this, EventArgs.Empty);
        }
    }
}
