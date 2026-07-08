namespace GyrMonitor.Client.Core.Networking;

// Host-only (no "/api/v1" suffix, see ApiRequestSender.BuildUrl). Local is not here since it is head/platform-specific.
public static class ApiEnvironmentCatalog
{
    public const string StagingBaseUrl = "https://gyrmonitor-staging.up.railway.app";
    public const string ProductionBaseUrl = "https://gyrmonitor-production.up.railway.app";
}
