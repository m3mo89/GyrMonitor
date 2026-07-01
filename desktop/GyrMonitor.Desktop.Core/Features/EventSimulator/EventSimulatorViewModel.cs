using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Desktop.Core.Features.Sync;

namespace GyrMonitor.Desktop.Core.Features.EventSimulator;

public sealed partial class EventSimulatorViewModel : ObservableObject
{
    private readonly IPendingEventRepository _events;
    private readonly ISyncQueueRepository _syncQueue;

    public event EventHandler? Saved;

    [ObservableProperty]
    private string cattleId = string.Empty;

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

    public EventSimulatorViewModel(IPendingEventRepository events, ISyncQueueRepository syncQueue)
    {
        _events = events;
        _syncQueue = syncQueue;
    }

    [RelayCommand]
    private async Task GenerateAsync()
    {
        if (IsBusy)
        {
            return;
        }

        ErrorMessage = null;

        if (string.IsNullOrWhiteSpace(CattleId))
        {
            ErrorMessage = "Select a cattle id before generating an event.";
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
                CattleId = CattleId,
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
