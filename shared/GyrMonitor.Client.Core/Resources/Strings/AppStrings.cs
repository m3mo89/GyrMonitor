using System.Globalization;
using System.Resources;

namespace GyrMonitor.Client.Core.Resources.Strings;

public static class AppStrings
{
    private static readonly ResourceManager ResourceManager = new("GyrMonitor.Client.Core.Resources.Strings.AppStrings", typeof(AppStrings).Assembly);

    public static string AppName => ResourceManager.GetString(nameof(AppName), CultureInfo.CurrentUICulture) ?? nameof(AppName);
    public static string EntityCattle => ResourceManager.GetString(nameof(EntityCattle), CultureInfo.CurrentUICulture) ?? nameof(EntityCattle);
    public static string InvalidCredentials => ResourceManager.GetString(nameof(InvalidCredentials), CultureInfo.CurrentUICulture) ?? nameof(InvalidCredentials);
    public static string EmailAndPasswordRequired => ResourceManager.GetString(nameof(EmailAndPasswordRequired), CultureInfo.CurrentUICulture) ?? nameof(EmailAndPasswordRequired);
    public static string UnableToSignInRetry => ResourceManager.GetString(nameof(UnableToSignInRetry), CultureInfo.CurrentUICulture) ?? nameof(UnableToSignInRetry);
    public static string UnableToReachServerRetry => ResourceManager.GetString(nameof(UnableToReachServerRetry), CultureInfo.CurrentUICulture) ?? nameof(UnableToReachServerRetry);
    public static string SyncFailedFormat => ResourceManager.GetString(nameof(SyncFailedFormat), CultureInfo.CurrentUICulture) ?? nameof(SyncFailedFormat);
    public static string SyncSummaryFormat => ResourceManager.GetString(nameof(SyncSummaryFormat), CultureInfo.CurrentUICulture) ?? nameof(SyncSummaryFormat);
}
