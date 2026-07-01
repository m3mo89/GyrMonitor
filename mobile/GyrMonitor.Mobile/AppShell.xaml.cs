using GyrMonitor.Mobile.Core.Features.Sync;
using GyrMonitor.Mobile.Core.Shared.Networking;
using GyrMonitor.Mobile.Core.Shared.Session;
using GyrMonitor.Mobile.Features.Alerts;
using GyrMonitor.Mobile.Features.Observations;
using GyrMonitor.Mobile.Shared.Navigation;

namespace GyrMonitor.Mobile;

public partial class AppShell : Shell
{
    private readonly IConnectivityService _connectivity;
    private readonly MobileSyncService _syncService;

    public AppShell(IConnectivityService connectivity, MobileSyncService syncService)
    {
        InitializeComponent();

        _connectivity = connectivity;
        _syncService = syncService;

        Routing.RegisterRoute(Routes.AlertDetail, typeof(AlertDetailPage));
        Routing.RegisterRoute(Routes.ObservationCapture, typeof(ObservationCapturePage));

        AuthenticationEvents.SessionExpired += OnSessionExpired;
        _connectivity.ConnectivityRestored += OnConnectivityRestored;
    }

    private void OnSessionExpired()
    {
        MainThread.BeginInvokeOnMainThread(async () => await GoToAsync($"//{Routes.Login}"));
    }

    private void OnConnectivityRestored(object? sender, EventArgs e)
    {
        _ = _syncService.SyncPendingObservationsAsync();
    }
}
