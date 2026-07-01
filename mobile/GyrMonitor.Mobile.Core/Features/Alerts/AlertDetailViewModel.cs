using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace GyrMonitor.Mobile.Core.Features.Alerts;

public sealed partial class AlertDetailViewModel : ObservableObject
{
    private readonly ILocalAlertRepository _localAlerts;

    [ObservableProperty]
    private LocalAlert? alert;

    [ObservableProperty]
    private bool notFound;

    public AlertDetailViewModel(ILocalAlertRepository localAlerts)
    {
        _localAlerts = localAlerts;
    }

    [RelayCommand]
    public async Task LoadAsync(string alertId)
    {
        var found = await _localAlerts.GetByIdAsync(alertId);
        Alert = found;
        NotFound = found is null;
    }
}
