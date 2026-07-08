using GyrMonitor.Desktop.Core.Features.Sync;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Desktop.Shared.Navigation;
using ClientStrings = GyrMonitor.Client.Core.Resources.Strings.AppStrings;
using DesktopStrings = GyrMonitor.Desktop.Core.Resources.Strings.AppStrings;

namespace GyrMonitor.Desktop;

public partial class AppShell : Shell
{
    private readonly IConnectivityService _connectivity;
    private readonly DesktopSyncService _syncService;
    private readonly IAuthSession _authSession;

    public AppShell(IConnectivityService connectivity, DesktopSyncService syncService, IAuthSession authSession)
    {
        InitializeComponent();

        _connectivity = connectivity;
        _syncService = syncService;
        _authSession = authSession;

        AuthenticationEvents.SessionExpired += OnSessionExpired;
        _connectivity.ConnectivityRestored += OnConnectivityRestored;
        _syncService.SyncCompleted += OnSyncCompleted;
        Navigated += OnShellNavigated;

        UpdateShellChrome();
    }

    private void OnSessionExpired()
    {
        MainThread.BeginInvokeOnMainThread(async () => await GoToAsync($"//{Routes.Login}"));
    }

    private void OnConnectivityRestored(object? sender, EventArgs e)
    {
        _ = _syncService.SyncPendingEventsAsync();
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

    private void OnSyncCompleted(object? sender, DesktopSyncSummary summary)
    {
        var message = BuildSyncMessage(summary);
        if (message is null)
        {
            return;
        }

        MainThread.BeginInvokeOnMainThread(() => SyncNotification.Show(message));
    }

    private static string? BuildSyncMessage(DesktopSyncSummary summary)
    {
        if (summary.ErrorMessage is not null)
        {
            return string.Format(ClientStrings.SyncFailedFormat, summary.ErrorMessage);
        }

        if (summary.Synced == 0 && summary.Duplicated == 0 && summary.Failed == 0)
        {
            return null;
        }

        return summary.Failed > 0
            ? string.Format(DesktopStrings.SyncNotificationSummaryWithFailuresFormat, summary.Synced, summary.Failed)
            : string.Format(DesktopStrings.SyncNotificationSummaryFormat, summary.Synced);
    }
}
