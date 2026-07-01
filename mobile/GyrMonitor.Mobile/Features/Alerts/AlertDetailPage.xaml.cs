using GyrMonitor.Mobile.Core.Features.Alerts;
using GyrMonitor.Mobile.Shared.Navigation;

namespace GyrMonitor.Mobile.Features.Alerts;

[QueryProperty(nameof(AlertId), Routes.AlertIdQueryKey)]
public partial class AlertDetailPage : ContentPage
{
    private readonly AlertDetailViewModel _viewModel;

    public string AlertId { get; set; } = string.Empty;

    public AlertDetailPage(AlertDetailViewModel viewModel)
    {
        InitializeComponent();
        _viewModel = viewModel;
        BindingContext = _viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await _viewModel.LoadCommand.ExecuteAsync(AlertId);
    }

    private async void OnAddObservationClicked(object? sender, EventArgs e)
    {
        await Shell.Current.GoToAsync($"{Routes.ObservationCapture}?{Routes.AlertIdQueryKey}={AlertId}");
    }
}
