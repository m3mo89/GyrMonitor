using GyrMonitor.Client.Core.Sync;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Mobile.Core.Features.Sync;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Mobile.Core.Shared.Authorization;

namespace GyrMonitor.Mobile.Core.Features.Observations;

public sealed partial class ObservationCaptureViewModel : ObservableObject
{
    private readonly IPendingObservationRepository _observations;
    private readonly IMobileSyncQueueRepository _syncQueue;
    private readonly IAuthSession _authSession;
    private readonly string _clientId;

    public event EventHandler? Saved;

    [ObservableProperty]
    private string alertId = string.Empty;

    [ObservableProperty]
    private string comment = string.Empty;

    [ObservableProperty]
    private string? errorMessage;

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private bool savedOffline;

    public ObservationCaptureViewModel(IPendingObservationRepository observations, IMobileSyncQueueRepository syncQueue, IAuthSession authSession, string clientId)
    {
        _observations = observations;
        _syncQueue = syncQueue;
        _authSession = authSession;
        _clientId = clientId;
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (IsBusy)
        {
            return;
        }

        ErrorMessage = null;

        if (string.IsNullOrWhiteSpace(AlertId))
        {
            ErrorMessage = "Select an alert before saving an observation.";
            return;
        }

        if (string.IsNullOrWhiteSpace(Comment))
        {
            ErrorMessage = "Comment must not be empty.";
            return;
        }

        IsBusy = true;

        try
        {
            var session = await _authSession.GetAsync();
            if (session is null || !MobileRoleAccess.IsSupported(session.Role))
            {
                ErrorMessage = "This mobile workflow is available only for field operators.";
                return;
            }

            var now = DateTime.UtcNow.ToString("O");
            var observation = new PendingObservation
            {
                LocalId = Guid.NewGuid().ToString(),
                ObservationId = Guid.NewGuid().ToString(),
                AlertId = AlertId,
                Comment = Comment.Trim(),
                CreatedAt = now,
                ClientId = _clientId,
                OwnerUserId = session.UserId,
                SyncStatus = SyncStatuses.Pending
            };

            await _observations.AddAsync(observation);

            await _syncQueue.AddAsync(new SyncQueueItem
            {
                LocalId = Guid.NewGuid().ToString(),
                EntityType = SyncEntityTypes.Observation,
                EntityLocalId = observation.LocalId,
                Operation = SyncOperations.Create,
                Status = SyncStatuses.Pending,
                CreatedAt = now,
                OwnerUserId = session.UserId
            });

            Comment = string.Empty;
            SavedOffline = true;
            Saved?.Invoke(this, EventArgs.Empty);
        }
        finally
        {
            IsBusy = false;
        }
    }
}
