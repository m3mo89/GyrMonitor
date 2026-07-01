using GyrMonitor.Desktop.Core.Features.EventSimulator;

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
}
