using CommunityToolkit.Mvvm.ComponentModel;
using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Desktop.Core.Features.Sync.Presentation;

public sealed partial class ConnectivityStatusViewModel : ObservableObject
{
    private readonly IConnectivityService _connectivity;

    [ObservableProperty]
    private bool isOffline;

    public ConnectivityStatusViewModel(IConnectivityService connectivity)
    {
        _connectivity = connectivity;
        isOffline = !_connectivity.IsConnected;

        _connectivity.ConnectivityChanged += OnConnectivityChanged;
    }

    private void OnConnectivityChanged(object? sender, bool isConnected)
    {
        IsOffline = !isConnected;
    }
}
