using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Desktop.Core.Shared.Networking;
using GyrMonitor.Desktop.Core.Shared.Session;

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
                "UNAUTHORIZED" => "Invalid email or password.",
                "VALIDATION_ERROR" => "Email and password are required.",
                _ => "Unable to sign in. Please try again."
            };
        }
        catch (Exception e)
        {
            ErrorMessage = "Unable to reach the server. Please try again.";
        }
        finally
        {
            IsBusy = false;
        }
    }
}
