using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Mobile.Core.Features.Alerts.Application;
using GyrMonitor.Mobile.Core.Features.Alerts.Domain;
using GyrMonitor.Mobile.Core.Resources.Strings;

namespace GyrMonitor.Mobile.Core.Features.Alerts.Presentation;

public sealed partial class AlertDetailViewModel : ObservableObject
{
    private readonly AlertsService _service;

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

    public AlertDetailViewModel(AlertsService service)
    {
        _service = service;
    }

    [RelayCommand]
    public async Task LoadAsync(string alertId)
    {
        var found = await _service.GetAlertDetailAsync(alertId);
        Alert = found;
        NotFound = found is null;
    }
}
