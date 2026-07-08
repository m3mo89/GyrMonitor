using GyrMonitor.Desktop.Core.Features.EventSimulator.Presentation;

namespace GyrMonitor.Desktop.Features.EventSimulator;

public partial class EventSimulatorPage : ContentPage
{
    private readonly EventSimulatorViewModel _viewModel;

    public EventSimulatorPage(EventSimulatorViewModel viewModel)
    {
        InitializeComponent();
        _viewModel = viewModel;
        BindingContext = _viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await _viewModel.LoadCattleCommand.ExecuteAsync(null);
    }
}
