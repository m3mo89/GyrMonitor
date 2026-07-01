namespace GyrMonitor.Desktop.Core.Shared.Session;

public static class AuthenticationEvents
{
    public static event Action? SessionExpired;

    public static void RaiseSessionExpired() => SessionExpired?.Invoke();
}
