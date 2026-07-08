using System.Globalization;
using System.Resources;

namespace GyrMonitor.Mobile.Core.Resources.Strings;

public static class AppStrings
{
    private static readonly ResourceManager ResourceManager = new("GyrMonitor.Mobile.Core.Resources.Strings.AppStrings", typeof(AppStrings).Assembly);

    public static string SignIn => ResourceManager.GetString(nameof(SignIn), CultureInfo.CurrentUICulture) ?? nameof(SignIn);
    public static string FieldOperatorSignInSubtitle => ResourceManager.GetString(nameof(FieldOperatorSignInSubtitle), CultureInfo.CurrentUICulture) ?? nameof(FieldOperatorSignInSubtitle);
    public static string EmailPlaceholder => ResourceManager.GetString(nameof(EmailPlaceholder), CultureInfo.CurrentUICulture) ?? nameof(EmailPlaceholder);
    public static string PasswordPlaceholder => ResourceManager.GetString(nameof(PasswordPlaceholder), CultureInfo.CurrentUICulture) ?? nameof(PasswordPlaceholder);
    public static string TabAlerts => ResourceManager.GetString(nameof(TabAlerts), CultureInfo.CurrentUICulture) ?? nameof(TabAlerts);
    public static string TabSync => ResourceManager.GetString(nameof(TabSync), CultureInfo.CurrentUICulture) ?? nameof(TabSync);
    public static string OfflineAlertsMessage => ResourceManager.GetString(nameof(OfflineAlertsMessage), CultureInfo.CurrentUICulture) ?? nameof(OfflineAlertsMessage);
    public static string AlertDetailTitle => ResourceManager.GetString(nameof(AlertDetailTitle), CultureInfo.CurrentUICulture) ?? nameof(AlertDetailTitle);
    public static string AlertNotFoundInCache => ResourceManager.GetString(nameof(AlertNotFoundInCache), CultureInfo.CurrentUICulture) ?? nameof(AlertNotFoundInCache);
    public static string SeverityFormat => ResourceManager.GetString(nameof(SeverityFormat), CultureInfo.CurrentUICulture) ?? nameof(SeverityFormat);
    public static string StatusFormat => ResourceManager.GetString(nameof(StatusFormat), CultureInfo.CurrentUICulture) ?? nameof(StatusFormat);
    public static string RiskScoreFormat => ResourceManager.GetString(nameof(RiskScoreFormat), CultureInfo.CurrentUICulture) ?? nameof(RiskScoreFormat);
    public static string ReasonFormat => ResourceManager.GetString(nameof(ReasonFormat), CultureInfo.CurrentUICulture) ?? nameof(ReasonFormat);
    public static string CreatedAtFormat => ResourceManager.GetString(nameof(CreatedAtFormat), CultureInfo.CurrentUICulture) ?? nameof(CreatedAtFormat);
    public static string AddObservation => ResourceManager.GetString(nameof(AddObservation), CultureInfo.CurrentUICulture) ?? nameof(AddObservation);
    public static string CommentLabel => ResourceManager.GetString(nameof(CommentLabel), CultureInfo.CurrentUICulture) ?? nameof(CommentLabel);
    public static string CommentPlaceholder => ResourceManager.GetString(nameof(CommentPlaceholder), CultureInfo.CurrentUICulture) ?? nameof(CommentPlaceholder);
    public static string Save => ResourceManager.GetString(nameof(Save), CultureInfo.CurrentUICulture) ?? nameof(Save);
    public static string ObservationSavedOffline => ResourceManager.GetString(nameof(ObservationSavedOffline), CultureInfo.CurrentUICulture) ?? nameof(ObservationSavedOffline);
    public static string SynchronizationTitle => ResourceManager.GetString(nameof(SynchronizationTitle), CultureInfo.CurrentUICulture) ?? nameof(SynchronizationTitle);
    public static string PendingItemsFormat => ResourceManager.GetString(nameof(PendingItemsFormat), CultureInfo.CurrentUICulture) ?? nameof(PendingItemsFormat);
    public static string SyncNow => ResourceManager.GetString(nameof(SyncNow), CultureInfo.CurrentUICulture) ?? nameof(SyncNow);
    public static string FieldOperatorOnly => ResourceManager.GetString(nameof(FieldOperatorOnly), CultureInfo.CurrentUICulture) ?? nameof(FieldOperatorOnly);
    public static string SelectAlertBeforeSaving => ResourceManager.GetString(nameof(SelectAlertBeforeSaving), CultureInfo.CurrentUICulture) ?? nameof(SelectAlertBeforeSaving);
    public static string CommentMustNotBeEmpty => ResourceManager.GetString(nameof(CommentMustNotBeEmpty), CultureInfo.CurrentUICulture) ?? nameof(CommentMustNotBeEmpty);
    public static string UnableToRefreshAlerts => ResourceManager.GetString(nameof(UnableToRefreshAlerts), CultureInfo.CurrentUICulture) ?? nameof(UnableToRefreshAlerts);
    public static string UnableToReachServerShowingLastSaved => ResourceManager.GetString(nameof(UnableToReachServerShowingLastSaved), CultureInfo.CurrentUICulture) ?? nameof(UnableToReachServerShowingLastSaved);
    public static string NoSupportedSessionActive => ResourceManager.GetString(nameof(NoSupportedSessionActive), CultureInfo.CurrentUICulture) ?? nameof(NoSupportedSessionActive);
}
