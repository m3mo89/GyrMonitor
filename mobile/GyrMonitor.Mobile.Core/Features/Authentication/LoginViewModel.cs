using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Client.Core.Authentication;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Mobile.Core.Shared.Authorization;
using ClientStrings = GyrMonitor.Client.Core.Resources.Strings.AppStrings;
using MobileStrings = GyrMonitor.Mobile.Core.Resources.Strings.AppStrings;

namespace GyrMonitor.Mobile.Core.Features.Authentication;

public sealed partial class LoginViewModel : ObservableObject
{
    private readonly IAuthApi _authApi;
    private readonly IAuthSession _authSession;
    private readonly IApiEnvironmentService _environmentService;

    public event EventHandler? LoginSucceeded;

    [ObservableProperty]
    private string email = string.Empty;

    [ObservableProperty]
    private string password = string.Empty;

    [ObservableProperty]
    private string? errorMessage;

    [ObservableProperty]
    private bool isBusy;

    public ObservableCollection<ApiEnvironmentOption> AvailableEnvironmentOptions { get; } = new();

    [ObservableProperty]
    private ApiEnvironmentOption? selectedEnvironmentOption;

    [ObservableProperty]
    private bool isEnvironmentPickerVisible;

    public LoginViewModel(IAuthApi authApi, IAuthSession authSession, IApiEnvironmentService environmentService)
    {
        _authApi = authApi;
        _authSession = authSession;
        _environmentService = environmentService;

        // Populated once and never rebuilt: the set of environments never changes, only which one is
        // selected. Clearing/re-adding this collection while the Picker is processing a selection
        // (see OnSelectedEnvironmentOptionChanged below) crashes the native Picker on Android/iOS.
        foreach (var environment in _environmentService.AvailableEnvironments)
        {
            AvailableEnvironmentOptions.Add(new ApiEnvironmentOption(environment, ApiEnvironmentDisplay.GetLabel(environment)));
        }

        SyncSelectedEnvironment();
    }

    [RelayCommand]
    private async Task InitializeEnvironmentAsync()
    {
        await _environmentService.InitializeAsync();
        SyncSelectedEnvironment();
    }

    partial void OnSelectedEnvironmentOptionChanged(ApiEnvironmentOption? value)
    {
        if (value is null || value.Value == _environmentService.CurrentEnvironment)
        {
            return;
        }

        _ = ChangeEnvironmentAsync(value.Value);
    }

    private async Task ChangeEnvironmentAsync(ApiEnvironment environment)
    {
        await _environmentService.SetEnvironmentAsync(environment);
        SyncSelectedEnvironment();
    }

    private void SyncSelectedEnvironment()
    {
        SelectedEnvironmentOption = AvailableEnvironmentOptions.FirstOrDefault(option => option.Value == _environmentService.CurrentEnvironment);
        IsEnvironmentPickerVisible = _environmentService.CurrentEnvironment != ApiEnvironment.Production;
    }

    [RelayCommand]
    private async Task LoginAsync()
    {
        if (IsBusy)
        {
            return;
        }

        ErrorMessage = null;
        IsBusy = true;

        try
        {
            var response = await _authApi.LoginAsync(Email.Trim(), Password);
            if (!MobileRoleAccess.IsSupported(response.User.Role))
            {
                ErrorMessage = MobileStrings.FieldOperatorOnly;
                return;
            }

            await _authSession.SaveAsync(new AuthSessionData(
                response.AccessToken,
                response.User.Id,
                response.User.Name,
                response.User.Email,
                response.User.Role));

            Password = string.Empty;
            LoginSucceeded?.Invoke(this, EventArgs.Empty);
        }
        catch (ApiException ex)
        {
            ErrorMessage = ex.Code switch
            {
                "UNAUTHORIZED" => ClientStrings.InvalidCredentials,
                "VALIDATION_ERROR" => ClientStrings.EmailAndPasswordRequired,
                _ => ClientStrings.UnableToSignInRetry
            };
        }
        catch (Exception)
        {
            ErrorMessage = ClientStrings.UnableToReachServerRetry;
        }
        finally
        {
            IsBusy = false;
        }
    }
}
