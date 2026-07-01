using GyrMonitor.Desktop.Core.Features.Dashboard;
using GyrMonitor.Desktop.Core.Shared.Session;
using GyrMonitor.Desktop.Shared.Navigation;

namespace GyrMonitor.Desktop.Features.Dashboard;

public partial class DashboardPage : ContentPage
{
    private readonly DashboardViewModel _viewModel;
    private readonly IAuthSession _authSession;

    public DashboardPage(DashboardViewModel viewModel, IAuthSession authSession)
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
}
