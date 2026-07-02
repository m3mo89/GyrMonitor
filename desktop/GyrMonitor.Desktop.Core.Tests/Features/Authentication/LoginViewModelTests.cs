using GyrMonitor.Desktop.Core.Features.Authentication;
using GyrMonitor.Client.Core.Authentication;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Session;
using Moq;

namespace GyrMonitor.Desktop.Core.Tests.Features.Authentication;

public class LoginViewModelTests
{
    [Fact]
    public async Task LoginAsync_SavesSessionAndRaisesLoginSucceeded_OnValidCredentials()
    {
        var authApi = new Mock<IAuthApi>();
        authApi
            .Setup(api => api.LoginAsync("field@gyrmonitor.test", "secret"))
            .ReturnsAsync(new LoginResponseDataDto
            {
                AccessToken = "token-123",
                ExpiresIn = 3600,
                User = new AuthenticatedUserDto { Id = "user-1", Name = "Field Operator", Email = "field@gyrmonitor.test", Role = "FIELD_OPERATOR" }
            });

        var authSession = new Mock<IAuthSession>();
        var viewModel = new LoginViewModel(authApi.Object, authSession.Object)
        {
            Email = "field@gyrmonitor.test",
            Password = "secret"
        };

        var raised = false;
        viewModel.LoginSucceeded += (_, _) => raised = true;

        await viewModel.LoginCommand.ExecuteAsync(null);

        Assert.True(raised);
        Assert.Null(viewModel.ErrorMessage);
        Assert.Equal(string.Empty, viewModel.Password);
        authSession.Verify(
            session => session.SaveAsync(It.Is<AuthSessionData>(data => data.AccessToken == "token-123" && data.Role == "FIELD_OPERATOR")),
            Times.Once);
    }

    [Fact]
    public async Task LoginAsync_SetsFriendlyError_OnInvalidCredentials()
    {
        var authApi = new Mock<IAuthApi>();
        authApi
            .Setup(api => api.LoginAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ThrowsAsync(new ApiException("UNAUTHORIZED", "Invalid credentials"));

        var authSession = new Mock<IAuthSession>();
        var viewModel = new LoginViewModel(authApi.Object, authSession.Object) { Email = "bad@gyrmonitor.test", Password = "wrong" };

        await viewModel.LoginCommand.ExecuteAsync(null);

        Assert.Equal("Invalid email or password.", viewModel.ErrorMessage);
        authSession.Verify(session => session.SaveAsync(It.IsAny<AuthSessionData>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_SetsNetworkError_WhenServerUnreachable()
    {
        var authApi = new Mock<IAuthApi>();
        authApi.Setup(api => api.LoginAsync(It.IsAny<string>(), It.IsAny<string>())).ThrowsAsync(new HttpRequestException("offline"));

        var viewModel = new LoginViewModel(authApi.Object, new Mock<IAuthSession>().Object) { Email = "a@b.com", Password = "secret" };

        await viewModel.LoginCommand.ExecuteAsync(null);

        Assert.Equal("Unable to reach the server. Please try again.", viewModel.ErrorMessage);
    }
}
