using GyrMonitor.Mobile.Core.Features.Sync.Application;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Mobile.Core.Shared.Authorization;
using GyrMonitor.Mobile.Features.Alerts;
using GyrMonitor.Mobile.Features.Observations;
using GyrMonitor.Mobile.Shared.Navigation;

namespace GyrMonitor.Mobile;

public partial class AppShell : Shell
{
    private readonly IConnectivityService _connectivity;
    private readonly MobileSyncService _syncService;
    private readonly IAuthSession _authSession;

    public AppShell(IConnectivityService connectivity, MobileSyncService syncService, IAuthSession authSession)
    {
        InitializeComponent();

        _connectivity = connectivity;
        _syncService = syncService;
        _authSession = authSession;

        Routing.RegisterRoute(Routes.AlertDetail, typeof(AlertDetailPage));
        Routing.RegisterRoute(Routes.ObservationCapture, typeof(ObservationCapturePage));

        AuthenticationEvents.SessionExpired += OnSessionExpired;
        _connectivity.ConnectivityRestored += OnConnectivityRestored;
        Navigated += OnShellNavigated;

        UpdateShellChrome();
    }

    private void OnSessionExpired()
    {
        MainThread.BeginInvokeOnMainThread(async () => await GoToAsync($"//{Routes.Login}"));
    }

    private async void OnConnectivityRestored(object? sender, EventArgs e)
    {
        var session = await _authSession.GetAsync();
        if (MobileRoleAccess.IsSupported(session?.Role))
        {
            _ = _syncService.SyncPendingObservationsAsync();
        }
    }

    private void OnShellNavigated(object? sender, ShellNavigatedEventArgs e)
    {
        UpdateShellChrome();
    }

    private void UpdateShellChrome()
    {
        PageTitleLabel.Text = CurrentPage?.Title;
        LogoutButton.IsVisible = CurrentState?.Location?.OriginalString.Contains(Routes.Login, StringComparison.OrdinalIgnoreCase) != true;
    }

    private async void OnLogoutClicked(object? sender, EventArgs e)
    {
        await _authSession.ClearAsync();
        await GoToAsync($"//{Routes.Login}");
    }
}
