using GyrMonitor.Desktop.Core.Features.Authentication;
using GyrMonitor.Desktop.Shared.Navigation;

namespace GyrMonitor.Desktop.Features.Authentication;

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

    private async void OnLoginSucceeded(object? sender, EventArgs e)
    {
        await Shell.Current.GoToAsync($"//{Routes.Dashboard}");
    }
}
