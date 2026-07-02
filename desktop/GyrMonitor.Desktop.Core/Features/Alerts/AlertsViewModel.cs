using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Desktop.Core.Features.Alerts;

public sealed partial class AlertsViewModel : ObservableObject
{
    private readonly IAlertsApi _alertsApi;

    public ObservableCollection<AlertSummaryDto> Alerts { get; } = new();

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private string? errorMessage;

    public AlertsViewModel(IAlertsApi alertsApi)
    {
        _alertsApi = alertsApi;
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
            var result = await _alertsApi.GetAlertsAsync();
            Alerts.Clear();
            foreach (var alert in result)
            {
                Alerts.Add(alert);
            }
        }
        catch (ApiException ex)
        {
            ErrorMessage = ex.Message;
        }
        catch (Exception)
        {
            ErrorMessage = "Unable to reach the server.";
        }
        finally
        {
            IsBusy = false;
        }
    }
}
