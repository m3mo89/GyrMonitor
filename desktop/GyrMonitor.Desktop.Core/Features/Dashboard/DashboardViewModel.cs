using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Desktop.Core.Features.Dashboard;

public sealed partial class DashboardViewModel : ObservableObject
{
    private readonly IDashboardApi _dashboardApi;

    [ObservableProperty]
    private DashboardMetricsDto? metrics;

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private string? errorMessage;

    public DashboardViewModel(IDashboardApi dashboardApi)
    {
        _dashboardApi = dashboardApi;
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
            Metrics = await _dashboardApi.GetDashboardAsync();
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
