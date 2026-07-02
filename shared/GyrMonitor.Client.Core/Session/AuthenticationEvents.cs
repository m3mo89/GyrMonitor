namespace GyrMonitor.Client.Core.Session;

public static class AuthenticationEvents
{
    public static event Action? SessionExpired;

    public static void RaiseSessionExpired() => SessionExpired?.Invoke();
}
