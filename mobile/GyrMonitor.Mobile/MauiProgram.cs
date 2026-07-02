using GyrMonitor.Mobile.Core.Features.Alerts;
using GyrMonitor.Mobile.Core.Features.Authentication;
using GyrMonitor.Mobile.Core.Features.Observations;
using GyrMonitor.Mobile.Core.Features.Sync;
using GyrMonitor.Client.Core.Alerts;
using GyrMonitor.Client.Core.Authentication;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Client.Core.Storage;
using GyrMonitor.Mobile.Features.Alerts;
using GyrMonitor.Mobile.Features.Authentication;
using GyrMonitor.Mobile.Features.Observations;
using GyrMonitor.Mobile.Features.Sync;
using GyrMonitor.Mobile.Shared.Networking;
using GyrMonitor.Mobile.Shared.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace GyrMonitor.Mobile;

public static class MauiProgram
{
#if ANDROID
    private const string ApiBaseUrl = "http://10.0.2.2:3000";
#else
    private const string ApiBaseUrl = "http://127.0.0.1:3000";
#endif
    private const string MobileClientId = "MOBILE-001";

    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
            });

#if DEBUG
        builder.Logging.AddDebug();
#endif

        RegisterServices(builder.Services);
        RegisterViewModels(builder.Services);
        RegisterPages(builder.Services);

        return builder.Build();
    }

    private static void RegisterServices(IServiceCollection services)
    {
        services.AddSingleton(new ApiOptions { BaseUrl = ApiBaseUrl });
        services.AddSingleton<HttpClient>();
        services.AddSingleton<ISecureKeyValueStore, SecureStorageKeyValueStore>();
        services.AddSingleton<IAuthSession, SecureAuthSession>();
        services.AddSingleton<ApiRequestSender>();
        services.AddSingleton<IConnectivityService, MauiConnectivityService>();

        services.AddSingleton<IAuthApi, AuthApiClient>();
        services.AddSingleton<IAlertsApi, AlertsApiClient>();
        services.AddSingleton<ISyncObservationsApi, SyncObservationsApiClient>();

        services.AddSingleton<ISqliteConnectionProvider>(_ =>
            new SqliteConnectionProvider(Path.Combine(FileSystem.AppDataDirectory, "gyrmonitor-mobile.db3")));
        services.AddSingleton<ILocalAlertRepository, SqliteLocalAlertRepository>();
        services.AddSingleton<IPendingObservationRepository, SqlitePendingObservationRepository>();
        services.AddSingleton<IMobileSyncQueueRepository, SqliteSyncQueueRepository>();

        services.AddSingleton(sp => new MobileSyncService(
            sp.GetRequiredService<IMobileSyncQueueRepository>(),
            sp.GetRequiredService<IPendingObservationRepository>(),
            sp.GetRequiredService<ISyncObservationsApi>(),
            sp.GetRequiredService<IAuthSession>(),
            MobileClientId));
    }

    private static void RegisterViewModels(IServiceCollection services)
    {
        services.AddTransient<LoginViewModel>();
        services.AddTransient<AlertsViewModel>();
        services.AddTransient<AlertDetailViewModel>();
        services.AddTransient<SyncViewModel>();
        services.AddTransient(sp => new ObservationCaptureViewModel(
            sp.GetRequiredService<IPendingObservationRepository>(),
            sp.GetRequiredService<IMobileSyncQueueRepository>(),
            sp.GetRequiredService<IAuthSession>(),
            MobileClientId));
    }

    private static void RegisterPages(IServiceCollection services)
    {
        services.AddTransient<AppShell>();
        services.AddTransient<LoginPage>();
        services.AddTransient<AlertsPage>();
        services.AddTransient<AlertDetailPage>();
        services.AddTransient<ObservationCapturePage>();
        services.AddTransient<SyncPage>();
    }
}
