using GyrMonitor.Client.Core.Alerts;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Mobile.Core.Features.Alerts;
using GyrMonitor.Mobile.Core.Features.Alerts.Domain;
using GyrMonitor.Mobile.Core.Shared.Authorization;

namespace GyrMonitor.Mobile.Core.Features.Alerts.Application;

public enum AlertsLoadOutcome
{
    Loaded,
    RoleNotSupported
}

public enum AlertsRemoteFailureReason
{
    None,
    ApiError,
    UnknownError
}

public sealed record AlertsLoadResult(AlertsLoadOutcome Outcome, IReadOnlyList<LocalAlert> Alerts, bool IsStale, AlertsRemoteFailureReason FailureReason);

public sealed class AlertsService
{
    private readonly IAlertsApi _alertsApi;
    private readonly ILocalAlertRepository _localAlerts;
    private readonly IConnectivityService _connectivity;
    private readonly IAuthSession _authSession;

    public AlertsService(IAlertsApi alertsApi, ILocalAlertRepository localAlerts, IConnectivityService connectivity, IAuthSession authSession)
    {
        _alertsApi = alertsApi;
        _localAlerts = localAlerts;
        _connectivity = connectivity;
        _authSession = authSession;
    }

    public async Task<AlertsLoadResult> LoadAlertsAsync()
    {
        var session = await _authSession.GetAsync();
        if (session is null || !MobileRoleAccess.IsSupported(session.Role))
        {
            return new AlertsLoadResult(AlertsLoadOutcome.RoleNotSupported, Array.Empty<LocalAlert>(), IsStale: false, AlertsRemoteFailureReason.None);
        }

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
                        CachedAt = cachedAt,
                        OwnerUserId = session.UserId,
                        LocalCacheId = $"{session.UserId}:{alert.Id}"
                    })
                    .ToList();

                await _localAlerts.ReplaceAllForUserAsync(session.UserId, localAlerts);
                return new AlertsLoadResult(AlertsLoadOutcome.Loaded, localAlerts, IsStale: false, AlertsRemoteFailureReason.None);
            }

            var cachedOffline = await _localAlerts.GetAllForUserAsync(session.UserId);
            return new AlertsLoadResult(AlertsLoadOutcome.Loaded, cachedOffline, IsStale: true, AlertsRemoteFailureReason.None);
        }
        catch (ApiException)
        {
            var cached = await _localAlerts.GetAllForUserAsync(session.UserId);
            return new AlertsLoadResult(AlertsLoadOutcome.Loaded, cached, IsStale: true, AlertsRemoteFailureReason.ApiError);
        }
        catch (Exception)
        {
            var cached = await _localAlerts.GetAllForUserAsync(session.UserId);
            return new AlertsLoadResult(AlertsLoadOutcome.Loaded, cached, IsStale: true, AlertsRemoteFailureReason.UnknownError);
        }
    }

    public async Task<LocalAlert?> GetAlertDetailAsync(string alertId)
    {
        var session = await _authSession.GetAsync();
        if (session is null || !MobileRoleAccess.IsSupported(session.Role))
        {
            return null;
        }

        return await _localAlerts.GetByIdForUserAsync(alertId, session.UserId);
    }
}
