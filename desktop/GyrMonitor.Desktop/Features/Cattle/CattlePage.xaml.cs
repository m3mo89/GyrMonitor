using GyrMonitor.Desktop.Core.Features.Cattle;

namespace GyrMonitor.Desktop.Features.Cattle;

public partial class CattlePage : ContentPage
{
    private readonly CattleViewModel _viewModel;

    public CattlePage(CattleViewModel viewModel)
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
