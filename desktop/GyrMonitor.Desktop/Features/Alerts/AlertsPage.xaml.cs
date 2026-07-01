using GyrMonitor.Desktop.Core.Features.Alerts;

namespace GyrMonitor.Desktop.Features.Alerts;

public partial class AlertsPage : ContentPage
{
    private readonly AlertsViewModel _viewModel;

    public AlertsPage(AlertsViewModel viewModel)
    {
        InitializeComponent();
        _viewModel = viewModel;
        BindingContext = _viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        _viewModel.LoadCommand.Execute(null);
    }
}
