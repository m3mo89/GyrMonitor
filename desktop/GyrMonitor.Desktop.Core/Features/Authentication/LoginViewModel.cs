using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Client.Core.Authentication;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Resources.Strings;
using GyrMonitor.Client.Core.Session;

namespace GyrMonitor.Desktop.Core.Features.Authentication;

public sealed partial class LoginViewModel : ObservableObject
{
    private readonly IAuthApi _authApi;
    private readonly IAuthSession _authSession;

    public event EventHandler? LoginSucceeded;

    [ObservableProperty]
    private string email = string.Empty;

    [ObservableProperty]
    private string password = string.Empty;

    [ObservableProperty]
    private string? errorMessage;

    [ObservableProperty]
    private bool isBusy;

    public LoginViewModel(IAuthApi authApi, IAuthSession authSession)
    {
        _authApi = authApi;
        _authSession = authSession;
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
                "UNAUTHORIZED" => AppStrings.InvalidCredentials,
                "VALIDATION_ERROR" => AppStrings.EmailAndPasswordRequired,
                _ => AppStrings.UnableToSignInRetry
            };
        }
        catch (Exception)
        {
            ErrorMessage = AppStrings.UnableToReachServerRetry;
        }
        finally
        {
            IsBusy = false;
        }
    }
}
