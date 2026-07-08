using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Mobile.Core.Features.Alerts.Application;
using GyrMonitor.Mobile.Core.Features.Alerts.Domain;
using GyrMonitor.Mobile.Core.Resources.Strings;

namespace GyrMonitor.Mobile.Core.Features.Alerts.Presentation;

public sealed partial class AlertsViewModel : ObservableObject
{
    private readonly AlertsService _service;
    private readonly IConnectivityService _connectivity;

    public ObservableCollection<LocalAlert> Alerts { get; } = new();

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private bool isStale;

    [ObservableProperty]
    private string? errorMessage;

    public bool IsOffline => !_connectivity.IsConnected;

    public AlertsViewModel(AlertsService service, IConnectivityService connectivity)
    {
        _service = service;
        _connectivity = connectivity;
    }

    [RelayCommand]
    public async Task LoadAsync()
    {
        if (IsBusy)
        {
            return;
        }

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var result = await _service.LoadAlertsAsync();

            if (result.Outcome == AlertsLoadOutcome.RoleNotSupported)
            {
                ReplaceAlerts([]);
                ErrorMessage = AppStrings.FieldOperatorOnly;
                return;
            }

            ReplaceAlerts(result.Alerts);
            IsStale = result.IsStale;

            ErrorMessage = result.FailureReason switch
            {
                AlertsRemoteFailureReason.ApiError => AppStrings.UnableToRefreshAlerts,
                AlertsRemoteFailureReason.UnknownError => AppStrings.UnableToReachServerShowingLastSaved,
                _ => null
            };
        }
        finally
        {
            IsBusy = false;
        }
    }

    private void ReplaceAlerts(IReadOnlyList<LocalAlert> alerts)
    {
        Alerts.Clear();
        foreach (var alert in alerts)
        {
            Alerts.Add(alert);
        }
    }
}
