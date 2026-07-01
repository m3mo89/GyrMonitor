using GyrMonitor.Desktop.Core.Features.Sync;

namespace GyrMonitor.Desktop.Features.Sync;

public partial class SyncPage : ContentPage
{
    private readonly SyncViewModel _viewModel;

    public SyncPage(SyncViewModel viewModel)
    {
        InitializeComponent();
        _viewModel = viewModel;
        BindingContext = _viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        _viewModel.RefreshPendingCountCommand.Execute(null);
    }
}
