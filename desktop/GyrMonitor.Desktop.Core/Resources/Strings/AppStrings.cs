using System.Globalization;
using System.Resources;

namespace GyrMonitor.Desktop.Core.Resources.Strings;

public static class AppStrings
{
    private static readonly ResourceManager ResourceManager = new("GyrMonitor.Desktop.Core.Resources.Strings.AppStrings", typeof(AppStrings).Assembly);

    public static string AppTitle => ResourceManager.GetString(nameof(AppTitle), CultureInfo.CurrentUICulture) ?? nameof(AppTitle);
    public static string SignIn => ResourceManager.GetString(nameof(SignIn), CultureInfo.CurrentUICulture) ?? nameof(SignIn);
    public static string TabDashboard => ResourceManager.GetString(nameof(TabDashboard), CultureInfo.CurrentUICulture) ?? nameof(TabDashboard);
    public static string TabCattle => ResourceManager.GetString(nameof(TabCattle), CultureInfo.CurrentUICulture) ?? nameof(TabCattle);
    public static string TabAlerts => ResourceManager.GetString(nameof(TabAlerts), CultureInfo.CurrentUICulture) ?? nameof(TabAlerts);
    public static string TabSimulator => ResourceManager.GetString(nameof(TabSimulator), CultureInfo.CurrentUICulture) ?? nameof(TabSimulator);
    public static string TabSync => ResourceManager.GetString(nameof(TabSync), CultureInfo.CurrentUICulture) ?? nameof(TabSync);
    public static string AdminSignInSubtitle => ResourceManager.GetString(nameof(AdminSignInSubtitle), CultureInfo.CurrentUICulture) ?? nameof(AdminSignInSubtitle);
    public static string EmailPlaceholder => ResourceManager.GetString(nameof(EmailPlaceholder), CultureInfo.CurrentUICulture) ?? nameof(EmailPlaceholder);
    public static string PasswordPlaceholder => ResourceManager.GetString(nameof(PasswordPlaceholder), CultureInfo.CurrentUICulture) ?? nameof(PasswordPlaceholder);
    public static string UnableToReachServer => ResourceManager.GetString(nameof(UnableToReachServer), CultureInfo.CurrentUICulture) ?? nameof(UnableToReachServer);
    public static string TotalCattle => ResourceManager.GetString(nameof(TotalCattle), CultureInfo.CurrentUICulture) ?? nameof(TotalCattle);
    public static string ActiveAlerts => ResourceManager.GetString(nameof(ActiveAlerts), CultureInfo.CurrentUICulture) ?? nameof(ActiveAlerts);
    public static string HighRisk => ResourceManager.GetString(nameof(HighRisk), CultureInfo.CurrentUICulture) ?? nameof(HighRisk);
    public static string AvgRisk => ResourceManager.GetString(nameof(AvgRisk), CultureInfo.CurrentUICulture) ?? nameof(AvgRisk);
    public static string EventsToday => ResourceManager.GetString(nameof(EventsToday), CultureInfo.CurrentUICulture) ?? nameof(EventsToday);
    public static string PendingSync => ResourceManager.GetString(nameof(PendingSync), CultureInfo.CurrentUICulture) ?? nameof(PendingSync);
    public static string RiskRanking => ResourceManager.GetString(nameof(RiskRanking), CultureInfo.CurrentUICulture) ?? nameof(RiskRanking);
    public static string NoRiskDataTitle => ResourceManager.GetString(nameof(NoRiskDataTitle), CultureInfo.CurrentUICulture) ?? nameof(NoRiskDataTitle);
    public static string NoRiskDataSubtitle => ResourceManager.GetString(nameof(NoRiskDataSubtitle), CultureInfo.CurrentUICulture) ?? nameof(NoRiskDataSubtitle);
    public static string NoCattleRecordsTitle => ResourceManager.GetString(nameof(NoCattleRecordsTitle), CultureInfo.CurrentUICulture) ?? nameof(NoCattleRecordsTitle);
    public static string NoCattleRecordsSubtitle => ResourceManager.GetString(nameof(NoCattleRecordsSubtitle), CultureInfo.CurrentUICulture) ?? nameof(NoCattleRecordsSubtitle);
    public static string NoAlertsTitle => ResourceManager.GetString(nameof(NoAlertsTitle), CultureInfo.CurrentUICulture) ?? nameof(NoAlertsTitle);
    public static string NoAlertsSubtitle => ResourceManager.GetString(nameof(NoAlertsSubtitle), CultureInfo.CurrentUICulture) ?? nameof(NoAlertsSubtitle);
    public static string EventSimulatorTitle => ResourceManager.GetString(nameof(EventSimulatorTitle), CultureInfo.CurrentUICulture) ?? nameof(EventSimulatorTitle);
    public static string CattleFieldLabel => ResourceManager.GetString(nameof(CattleFieldLabel), CultureInfo.CurrentUICulture) ?? nameof(CattleFieldLabel);
    public static string EventTypeLabel => ResourceManager.GetString(nameof(EventTypeLabel), CultureInfo.CurrentUICulture) ?? nameof(EventTypeLabel);
    public static string InactivityOption => ResourceManager.GetString(nameof(InactivityOption), CultureInfo.CurrentUICulture) ?? nameof(InactivityOption);
    public static string ActivityOption => ResourceManager.GetString(nameof(ActivityOption), CultureInfo.CurrentUICulture) ?? nameof(ActivityOption);
    public static string InactiveMinutesLabel => ResourceManager.GetString(nameof(InactiveMinutesLabel), CultureInfo.CurrentUICulture) ?? nameof(InactiveMinutesLabel);
    public static string ConfidenceRangeLabel => ResourceManager.GetString(nameof(ConfidenceRangeLabel), CultureInfo.CurrentUICulture) ?? nameof(ConfidenceRangeLabel);
    public static string RefreshCattle => ResourceManager.GetString(nameof(RefreshCattle), CultureInfo.CurrentUICulture) ?? nameof(RefreshCattle);
    public static string GenerateEvent => ResourceManager.GetString(nameof(GenerateEvent), CultureInfo.CurrentUICulture) ?? nameof(GenerateEvent);
    public static string SavedOfflineDescription => ResourceManager.GetString(nameof(SavedOfflineDescription), CultureInfo.CurrentUICulture) ?? nameof(SavedOfflineDescription);
    public static string NoCattleForSimulation => ResourceManager.GetString(nameof(NoCattleForSimulation), CultureInfo.CurrentUICulture) ?? nameof(NoCattleForSimulation);
    public static string SelectCattleBeforeGenerate => ResourceManager.GetString(nameof(SelectCattleBeforeGenerate), CultureInfo.CurrentUICulture) ?? nameof(SelectCattleBeforeGenerate);
    public static string ConfidenceRangeError => ResourceManager.GetString(nameof(ConfidenceRangeError), CultureInfo.CurrentUICulture) ?? nameof(ConfidenceRangeError);
    public static string UnableToLoadCattleRecordsFormat => ResourceManager.GetString(nameof(UnableToLoadCattleRecordsFormat), CultureInfo.CurrentUICulture) ?? nameof(UnableToLoadCattleRecordsFormat);
    public static string SynchronizationTitle => ResourceManager.GetString(nameof(SynchronizationTitle), CultureInfo.CurrentUICulture) ?? nameof(SynchronizationTitle);
    public static string AllSyncedTitle => ResourceManager.GetString(nameof(AllSyncedTitle), CultureInfo.CurrentUICulture) ?? nameof(AllSyncedTitle);
    public static string AllSyncedSubtitle => ResourceManager.GetString(nameof(AllSyncedSubtitle), CultureInfo.CurrentUICulture) ?? nameof(AllSyncedSubtitle);
    public static string PendingItemsLabel => ResourceManager.GetString(nameof(PendingItemsLabel), CultureInfo.CurrentUICulture) ?? nameof(PendingItemsLabel);
    public static string PendingBadge => ResourceManager.GetString(nameof(PendingBadge), CultureInfo.CurrentUICulture) ?? nameof(PendingBadge);
    public static string SyncNow => ResourceManager.GetString(nameof(SyncNow), CultureInfo.CurrentUICulture) ?? nameof(SyncNow);
    public static string OfflineBannerMessage => ResourceManager.GetString(nameof(OfflineBannerMessage), CultureInfo.CurrentUICulture) ?? nameof(OfflineBannerMessage);
    public static string NothingHereYet => ResourceManager.GetString(nameof(NothingHereYet), CultureInfo.CurrentUICulture) ?? nameof(NothingHereYet);
    public static string SyncNotificationSummaryWithFailuresFormat => ResourceManager.GetString(nameof(SyncNotificationSummaryWithFailuresFormat), CultureInfo.CurrentUICulture) ?? nameof(SyncNotificationSummaryWithFailuresFormat);
    public static string SyncNotificationSummaryFormat => ResourceManager.GetString(nameof(SyncNotificationSummaryFormat), CultureInfo.CurrentUICulture) ?? nameof(SyncNotificationSummaryFormat);
}
