using GyrMonitor.Mobile.Core.Features.Authentication;
using GyrMonitor.Mobile.Shared.Navigation;

namespace GyrMonitor.Mobile.Features.Authentication;

public partial class LoginPage : ContentPage
{
    private readonly LoginViewModel _viewModel;

    public LoginPage(LoginViewModel viewModel)
    {
        InitializeComponent();
        _viewModel = viewModel;
        BindingContext = _viewModel;
        _viewModel.LoginSucceeded += OnLoginSucceeded;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await _viewModel.InitializeEnvironmentCommand.ExecuteAsync(null);
    }

    private async void OnLoginSucceeded(object? sender, EventArgs e)
    {
        await Shell.Current.GoToAsync($"//{Routes.Alerts}");
    }
}
