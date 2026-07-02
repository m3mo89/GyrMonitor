namespace GyrMonitor.Mobile.Core.Shared.Authorization;

public static class MobileRoleAccess
{
    public static bool IsSupported(string? role) => role is "FIELD_OPERATOR" or "ADMIN";
}
