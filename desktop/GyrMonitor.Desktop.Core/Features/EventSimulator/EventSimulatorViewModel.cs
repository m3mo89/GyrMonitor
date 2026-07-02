using GyrMonitor.Client.Core.Sync;
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Desktop.Core.Features.Cattle;
using GyrMonitor.Desktop.Core.Features.Sync;

namespace GyrMonitor.Desktop.Core.Features.EventSimulator;

public sealed partial class EventSimulatorViewModel : ObservableObject
{
    private readonly IPendingEventRepository _events;
    private readonly ISyncQueueRepository _syncQueue;
    private readonly ICattleApi _cattleApi;

    public event EventHandler? Saved;

    public ObservableCollection<CattleSelectionItem> CattleOptions { get; } = new();

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasCattleOptions))]
    private CattleSelectionItem? selectedCattle;

    public bool HasCattleOptions => CattleOptions.Count > 0;

    [ObservableProperty]
    private bool isInactivity = true;

    [ObservableProperty]
    private int inactiveMinutes = 60;

    [ObservableProperty]
    private double confidence = 0.9;

    [ObservableProperty]
    private string? errorMessage;

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private bool savedOffline;

    public EventSimulatorViewModel(IPendingEventRepository events, ISyncQueueRepository syncQueue, ICattleApi cattleApi)
    {
        _events = events;
        _syncQueue = syncQueue;
        _cattleApi = cattleApi;
    }

    [RelayCommand]
    public async Task LoadCattleAsync()
    {
        if (IsBusy)
        {
            return;
        }

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var cattle = await _cattleApi.GetCattleAsync();
            CattleOptions.Clear();
            foreach (var item in cattle)
            {
                CattleOptions.Add(new CattleSelectionItem(item.Id, item.TagNumber, item.Status));
            }

            OnPropertyChanged(nameof(HasCattleOptions));
            SelectedCattle ??= CattleOptions.FirstOrDefault();

            if (CattleOptions.Count == 0)
            {
                ErrorMessage = "No cattle records are available for simulation.";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Unable to load cattle records: {ex.Message}";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task GenerateAsync()
    {
        if (IsBusy)
        {
            return;
        }

        ErrorMessage = null;

        if (SelectedCattle is null)
        {
            ErrorMessage = "Select a cattle record before generating an event.";
            return;
        }

        if (Confidence is < 0 or > 1)
        {
            ErrorMessage = "Confidence must be between 0 and 1.";
            return;
        }

        IsBusy = true;

        try
        {
            var now = DateTime.UtcNow.ToString("O");
            var pendingEvent = new PendingEvent
            {
                LocalId = Guid.NewGuid().ToString(),
                EventId = Guid.NewGuid().ToString(),
                CattleId = SelectedCattle.Id,
                EventType = IsInactivity ? SimulatedEventTypes.Inactivity : SimulatedEventTypes.Activity,
                InactiveMinutes = IsInactivity ? InactiveMinutes : null,
                Confidence = Confidence,
                CapturedAt = now,
                Source = SimulatedEventSource.DesktopSimulator,
                SyncStatus = SyncStatuses.Pending
            };

            await _events.AddAsync(pendingEvent);

            await _syncQueue.AddAsync(new SyncQueueItem
            {
                LocalId = Guid.NewGuid().ToString(),
                EntityType = SyncEntityTypes.Event,
                EntityLocalId = pendingEvent.LocalId,
                Operation = SyncOperations.Create,
                Status = SyncStatuses.Pending,
                CreatedAt = now
            });

            SavedOffline = true;
            Saved?.Invoke(this, EventArgs.Empty);
        }
        finally
        {
            IsBusy = false;
        }
    }
}

public sealed record CattleSelectionItem(string Id, string TagNumber, string Status)
{
    public string DisplayName => string.IsNullOrWhiteSpace(TagNumber)
        ? $"{Id} ({Status})"
        : $"{TagNumber} ({Status})";
}
