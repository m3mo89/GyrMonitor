using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Client.Core.Alerts;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Mobile.Core.Resources.Strings;
using GyrMonitor.Mobile.Core.Shared.Authorization;

namespace GyrMonitor.Mobile.Core.Features.Alerts;

public sealed partial class AlertsViewModel : ObservableObject
{
    private readonly IAlertsApi _alertsApi;
    private readonly ILocalAlertRepository _localAlerts;
    private readonly IConnectivityService _connectivity;
    private readonly IAuthSession _authSession;

    public ObservableCollection<LocalAlert> Alerts { get; } = new();

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private bool isStale;

    [ObservableProperty]
    private string? errorMessage;

    public bool IsOffline => !_connectivity.IsConnected;

    public AlertsViewModel(IAlertsApi alertsApi, ILocalAlertRepository localAlerts, IConnectivityService connectivity, IAuthSession authSession)
    {
        _alertsApi = alertsApi;
        _localAlerts = localAlerts;
        _connectivity = connectivity;
        _authSession = authSession;
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
            var session = await _authSession.GetAsync();
            if (session is null || !MobileRoleAccess.IsSupported(session.Role))
            {
                ReplaceAlerts([]);
                ErrorMessage = AppStrings.FieldOperatorOnly;
                return;
            }

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
                        CachedAt = cachedAt,
                        OwnerUserId = session.UserId,
                        LocalCacheId = $"{session.UserId}:{alert.Id}"
                    })
                    .ToList();

                await _localAlerts.ReplaceAllForUserAsync(session.UserId, localAlerts);
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
            ErrorMessage = AppStrings.UnableToRefreshAlerts;
        }
        catch (Exception)
        {
            await LoadFromCacheAsync(markStale: true);
            ErrorMessage = AppStrings.UnableToReachServerShowingLastSaved;
        }
        finally
        {
            IsBusy = false;
        }
    }

    private async Task LoadFromCacheAsync(bool markStale)
    {
        var session = await _authSession.GetAsync();
        if (session is null || !MobileRoleAccess.IsSupported(session.Role))
        {
            ReplaceAlerts([]);
            IsStale = markStale;
            return;
        }

        var cached = await _localAlerts.GetAllForUserAsync(session.UserId);
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
