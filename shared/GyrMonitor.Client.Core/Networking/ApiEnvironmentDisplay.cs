using GyrMonitor.Client.Core.Resources.Strings;

namespace GyrMonitor.Client.Core.Networking;

public static class ApiEnvironmentDisplay
{
    public static string GetLabel(ApiEnvironment environment) => environment switch
    {
        ApiEnvironment.Local => AppStrings.EnvironmentLocal,
        ApiEnvironment.Staging => AppStrings.EnvironmentStaging,
        ApiEnvironment.Production => AppStrings.EnvironmentProduction,
        _ => environment.ToString()
    };
}
