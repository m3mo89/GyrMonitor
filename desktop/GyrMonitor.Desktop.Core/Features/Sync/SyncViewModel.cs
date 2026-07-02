using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Desktop.Core.Features.Sync;

public sealed partial class SyncViewModel : ObservableObject
{
    private readonly DesktopSyncService _syncService;
    private readonly IConnectivityService _connectivity;

    [ObservableProperty]
    private int pendingCount;

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private string? statusMessage;

    public bool IsOffline => !_connectivity.IsConnected;

    public SyncViewModel(DesktopSyncService syncService, IConnectivityService connectivity)
    {
        _syncService = syncService;
        _connectivity = connectivity;
    }

    [RelayCommand]
    public async Task RefreshPendingCountAsync()
    {
        PendingCount = await _syncService.GetPendingCountAsync();
    }

    [RelayCommand]
    public async Task SyncNowAsync()
    {
        if (IsBusy)
        {
            return;
        }

        IsBusy = true;
        StatusMessage = null;

        try
        {
            var summary = await _syncService.SyncPendingEventsAsync();
            StatusMessage = summary.ErrorMessage is not null
                ? $"Sync failed: {summary.ErrorMessage}"
                : $"Synced {summary.Synced}, duplicates {summary.Duplicated}, failed {summary.Failed}.";
        }
        finally
        {
            PendingCount = await _syncService.GetPendingCountAsync();
            IsBusy = false;
        }
    }
}
