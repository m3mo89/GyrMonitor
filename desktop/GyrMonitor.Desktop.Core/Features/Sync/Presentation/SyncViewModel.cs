using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Client.Core.Resources.Strings;
using GyrMonitor.Desktop.Core.Features.Sync.Application;

namespace GyrMonitor.Desktop.Core.Features.Sync.Presentation;

public sealed partial class SyncViewModel : ObservableObject
{
    private readonly DesktopSyncService _syncService;

    [ObservableProperty]
    private int pendingCount;

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private string? statusMessage;

    public SyncViewModel(DesktopSyncService syncService)
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
            var summary = await _syncService.SyncPendingEventsAsync();
            StatusMessage = summary.ErrorMessage is not null
                ? string.Format(AppStrings.SyncFailedFormat, summary.ErrorMessage)
                : string.Format(AppStrings.SyncSummaryFormat, summary.Synced, summary.Duplicated, summary.Failed);
        }
        finally
        {
            PendingCount = await _syncService.GetPendingCountAsync();
            IsBusy = false;
        }
    }
}
