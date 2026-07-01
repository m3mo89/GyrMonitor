using GyrMonitor.Mobile.Core.Features.Observations;
using GyrMonitor.Mobile.Shared.Navigation;

namespace GyrMonitor.Mobile.Features.Observations;

[QueryProperty(nameof(AlertId), Routes.AlertIdQueryKey)]
public partial class ObservationCapturePage : ContentPage
{
    private readonly ObservationCaptureViewModel _viewModel;

    public string AlertId
    {
        get => _viewModel.AlertId;
        set => _viewModel.AlertId = value;
    }

    public ObservationCapturePage(ObservationCaptureViewModel viewModel)
    {
        InitializeComponent();
        _viewModel = viewModel;
        BindingContext = _viewModel;
        _viewModel.Saved += OnSaved;
    }

    private async void OnSaved(object? sender, EventArgs e)
    {
        await Shell.Current.GoToAsync("..");
    }
}
