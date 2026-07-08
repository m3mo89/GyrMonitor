using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Mobile.Core.Resources.Strings;
using GyrMonitor.Mobile.Core.Shared.Authorization;

namespace GyrMonitor.Mobile.Core.Features.Alerts;

public sealed partial class AlertDetailViewModel : ObservableObject
{
    private readonly ILocalAlertRepository _localAlerts;
    private readonly IAuthSession _authSession;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(DisplaySeverity))]
    [NotifyPropertyChangedFor(nameof(DisplayStatus))]
    [NotifyPropertyChangedFor(nameof(DisplayRiskScore))]
    [NotifyPropertyChangedFor(nameof(DisplayReason))]
    [NotifyPropertyChangedFor(nameof(DisplayCreatedAt))]
    private LocalAlert? alert;

    [ObservableProperty]
    private bool notFound;

    public string DisplaySeverity => string.Format(AppStrings.SeverityFormat, Alert?.Severity);

    public string DisplayStatus => string.Format(AppStrings.StatusFormat, Alert?.Status);

    public string DisplayRiskScore => string.Format(AppStrings.RiskScoreFormat, Alert?.RiskScore);

    public string DisplayReason => string.Format(AppStrings.ReasonFormat, Alert?.Reason);

    public string DisplayCreatedAt => string.Format(AppStrings.CreatedAtFormat, Alert?.CreatedAt);

    public AlertDetailViewModel(ILocalAlertRepository localAlerts, IAuthSession authSession)
    {
        _localAlerts = localAlerts;
        _authSession = authSession;
    }

    [RelayCommand]
    public async Task LoadAsync(string alertId)
    {
        var session = await _authSession.GetAsync();
        var found = session is not null && MobileRoleAccess.IsSupported(session.Role)
            ? await _localAlerts.GetByIdForUserAsync(alertId, session.UserId)
            : null;
        Alert = found;
        NotFound = found is null;
    }
}
