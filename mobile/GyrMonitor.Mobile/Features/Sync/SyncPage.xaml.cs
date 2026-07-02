using GyrMonitor.Mobile.Core.Features.Sync;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Mobile.Core.Shared.Authorization;
using GyrMonitor.Mobile.Shared.Navigation;

namespace GyrMonitor.Mobile.Features.Sync;

public partial class SyncPage : ContentPage
{
    private readonly SyncViewModel _viewModel;
    private readonly IAuthSession _authSession;

    public SyncPage(SyncViewModel viewModel, IAuthSession authSession)
    {
        InitializeComponent();
        _viewModel = viewModel;
        _authSession = authSession;
        BindingContext = _viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        var session = await _authSession.GetAsync();
        if (session is null || !MobileRoleAccess.IsSupported(session.Role))
        {
            await Shell.Current.GoToAsync($"//{Routes.Login}");
            return;
        }

        await _viewModel.RefreshPendingCountCommand.ExecuteAsync(null);
    }
}
