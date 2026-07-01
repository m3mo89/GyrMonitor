using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace GyrMonitor.Mobile.Core.Features.Sync;

public sealed partial class SyncViewModel : ObservableObject
{
    private readonly MobileSyncService _syncService;

    [ObservableProperty]
    private int pendingCount;

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private string? statusMessage;

    public SyncViewModel(MobileSyncService syncService)
    {
        _syncService = syncService;
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
            var summary = await _syncService.SyncPendingObservationsAsync();
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
