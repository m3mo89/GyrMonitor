using GyrMonitor.Mobile.Core.Features.Observations.Presentation;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Mobile.Core.Shared.Authorization;
using GyrMonitor.Mobile.Shared.Navigation;

namespace GyrMonitor.Mobile.Features.Observations;

[QueryProperty(nameof(AlertId), Routes.AlertIdQueryKey)]
public partial class ObservationCapturePage : ContentPage
{
    private readonly ObservationCaptureViewModel _viewModel;
    private readonly IAuthSession _authSession;

    public string AlertId
    {
        get => _viewModel.AlertId;
        set => _viewModel.AlertId = value;
    }

    public ObservationCapturePage(ObservationCaptureViewModel viewModel, IAuthSession authSession)
    {
        InitializeComponent();
        _viewModel = viewModel;
        _authSession = authSession;
        BindingContext = _viewModel;
        _viewModel.Saved += OnSaved;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        var session = await _authSession.GetAsync();
        if (session is null || !MobileRoleAccess.IsSupported(session.Role))
        {
            await Shell.Current.GoToAsync($"//{Routes.Login}");
        }
    }

    private async void OnSaved(object? sender, EventArgs e)
    {
        await Shell.Current.GoToAsync("..");
    }
}
