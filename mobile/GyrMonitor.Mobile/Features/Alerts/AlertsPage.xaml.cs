using GyrMonitor.Mobile.Core.Features.Alerts;
using GyrMonitor.Mobile.Core.Shared.Session;
using GyrMonitor.Mobile.Shared.Navigation;

namespace GyrMonitor.Mobile.Features.Alerts;

public partial class AlertsPage : ContentPage
{
    private readonly AlertsViewModel _viewModel;
    private readonly IAuthSession _authSession;

    public AlertsPage(AlertsViewModel viewModel, IAuthSession authSession)
    {
        InitializeComponent();
        _viewModel = viewModel;
        _authSession = authSession;
        BindingContext = _viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();

        if (await _authSession.GetAsync() is null)
        {
            await Shell.Current.GoToAsync($"//{Routes.Login}");
            return;
        }

        await _viewModel.LoadCommand.ExecuteAsync(null);
    }

    private async void OnAlertSelected(object? sender, SelectionChangedEventArgs e)
    {
        if (e.CurrentSelection.FirstOrDefault() is not LocalAlert alert)
        {
            return;
        }

        ((CollectionView)sender!).SelectedItem = null;
        await Shell.Current.GoToAsync($"{Routes.AlertDetail}?{Routes.AlertIdQueryKey}={alert.Id}");
    }

    private async void OnSyncTapped(object? sender, EventArgs e)
    {
        await Shell.Current.GoToAsync(Routes.Sync);
    }
}
