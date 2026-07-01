using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Mobile.Core.Shared.Networking;

namespace GyrMonitor.Mobile.Core.Features.Alerts;

public sealed partial class AlertsViewModel : ObservableObject
{
    private readonly IAlertsApi _alertsApi;
    private readonly ILocalAlertRepository _localAlerts;
    private readonly IConnectivityService _connectivity;

    public ObservableCollection<LocalAlert> Alerts { get; } = new();

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private bool isStale;

    [ObservableProperty]
    private string? errorMessage;

    public bool IsOffline => !_connectivity.IsConnected;

    public AlertsViewModel(IAlertsApi alertsApi, ILocalAlertRepository localAlerts, IConnectivityService connectivity)
    {
        _alertsApi = alertsApi;
        _localAlerts = localAlerts;
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
            if (_connectivity.IsConnected)
            {
                var remoteAlerts = await _alertsApi.GetAlertsAsync();
                var cachedAt = DateTime.UtcNow.ToString("O");
                var localAlerts = remoteAlerts
                    .Select(alert => new LocalAlert
                    {
                        Id = alert.Id,
                        CattleId = alert.CattleId,
                        TagNumber = alert.TagNumber ?? string.Empty,
                        Severity = alert.Severity,
                        RiskScore = alert.RiskScore,
                        Status = alert.Status,
                        Reason = alert.Reason,
                        CreatedAt = alert.CreatedAt,
                        CachedAt = cachedAt
                    })
                    .ToList();

                await _localAlerts.ReplaceAllAsync(localAlerts);
                ReplaceAlerts(localAlerts);
                IsStale = false;
            }
            else
            {
                await LoadFromCacheAsync(markStale: true);
            }
        }
        catch (ApiException)
        {
            await LoadFromCacheAsync(markStale: true);
            ErrorMessage = "Unable to refresh alerts. Showing the last saved data.";
        }
        catch (Exception)
        {
            await LoadFromCacheAsync(markStale: true);
            ErrorMessage = "Unable to reach the server. Showing the last saved data.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    private async Task LoadFromCacheAsync(bool markStale)
    {
        var cached = await _localAlerts.GetAllAsync();
        ReplaceAlerts(cached);
        IsStale = markStale;
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
