using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Mobile.Core.Resources.Strings;
using ClientStrings = GyrMonitor.Client.Core.Resources.Strings.AppStrings;

namespace GyrMonitor.Mobile.Core.Features.Sync;

public sealed partial class SyncViewModel : ObservableObject
{
    private readonly MobileSyncService _syncService;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(DisplayPendingItems))]
    private int pendingCount;

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private string? statusMessage;

    public string DisplayPendingItems => string.Format(AppStrings.PendingItemsFormat, PendingCount);

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
                ? string.Format(ClientStrings.SyncFailedFormat, summary.ErrorMessage)
                : string.Format(ClientStrings.SyncSummaryFormat, summary.Synced, summary.Duplicated, summary.Failed);
        }
        finally
        {
            PendingCount = await _syncService.GetPendingCountAsync();
            IsBusy = false;
        }
    }
}
