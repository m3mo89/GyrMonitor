using GyrMonitor.Desktop.Core.Features.Sync;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Desktop.Shared.Navigation;

namespace GyrMonitor.Desktop;

public partial class AppShell : Shell
{
    private readonly IConnectivityService _connectivity;
    private readonly DesktopSyncService _syncService;

    public AppShell(IConnectivityService connectivity, DesktopSyncService syncService)
    {
        InitializeComponent();

        _connectivity = connectivity;
        _syncService = syncService;

        AuthenticationEvents.SessionExpired += OnSessionExpired;
        _connectivity.ConnectivityRestored += OnConnectivityRestored;
    }

    private void OnSessionExpired()
    {
        MainThread.BeginInvokeOnMainThread(async () => await GoToAsync($"//{Routes.Login}"));
    }

    private void OnConnectivityRestored(object? sender, EventArgs e)
    {
        _ = _syncService.SyncPendingEventsAsync();
    }
}
