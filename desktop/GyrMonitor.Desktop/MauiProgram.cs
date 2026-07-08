using GyrMonitor.Desktop.Core.Features.Alerts;
using GyrMonitor.Desktop.Core.Features.Authentication;
using GyrMonitor.Desktop.Core.Features.Cattle;
using GyrMonitor.Desktop.Core.Features.Dashboard;
using GyrMonitor.Desktop.Core.Features.EventSimulator;
using GyrMonitor.Desktop.Core.Features.EventSimulator.Application;
using GyrMonitor.Desktop.Core.Features.EventSimulator.Infrastructure;
using GyrMonitor.Desktop.Core.Features.EventSimulator.Presentation;
using GyrMonitor.Desktop.Core.Features.Sync;
using GyrMonitor.Desktop.Core.Features.Sync.Application;
using GyrMonitor.Desktop.Core.Features.Sync.Infrastructure;
using GyrMonitor.Desktop.Core.Features.Sync.Presentation;
using GyrMonitor.Client.Core.Alerts;
using GyrMonitor.Client.Core.Authentication;
using GyrMonitor.Client.Core.Networking;
using GyrMonitor.Client.Core.Session;
using GyrMonitor.Client.Core.Storage;
using GyrMonitor.Client.Core.Sync;
using GyrMonitor.Client.Core.Sync.Infrastructure;
using GyrMonitor.Desktop.Features.Alerts;
using GyrMonitor.Desktop.Features.Authentication;
using GyrMonitor.Desktop.Features.Cattle;
using GyrMonitor.Desktop.Features.Dashboard;
using GyrMonitor.Desktop.Features.EventSimulator;
using GyrMonitor.Desktop.Features.Sync;
using GyrMonitor.Desktop.Shared.Networking;
using GyrMonitor.Desktop.Shared.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Globalization;

namespace GyrMonitor.Desktop;

public static class MauiProgram
{
    private const string LocalBaseUrl = "http://127.0.0.1:3000";
    private const string DesktopClientId = "DESKTOP-001";
    private const string DesktopDeviceId = "DEVICE-DESKTOP-001";

#if DEBUG
    private const ApiEnvironment DefaultEnvironment = ApiEnvironment.Local;
#else
    private const ApiEnvironment DefaultEnvironment = ApiEnvironment.Production;
#endif

    public static MauiApp CreateMauiApp()
    {
        // Only CurrentUICulture (resx satellite selection) is set here, not CurrentCulture,
        // so numeric/date formatting (e.g. risk score StringFormat bindings) is unaffected.
        CultureInfo.CurrentUICulture = new CultureInfo("es");

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

        var app = builder.Build();

        // Forces ApiEnvironmentService's constructor to run (and set ApiOptions.BaseUrl) before
        // the first page appears, since MAUI's DI container otherwise only builds singletons lazily.
        _ = app.Services.GetRequiredService<IApiEnvironmentService>();

        return app;
    }

    private static void RegisterServices(IServiceCollection services)
    {
        services.AddSingleton(new ApiOptions { BaseUrl = LocalBaseUrl });
        services.AddSingleton<HttpClient>();
        services.AddSingleton<ISecureKeyValueStore, SecureStorageKeyValueStore>();
        services.AddSingleton<IApiEnvironmentStore, ApiEnvironmentStore>();
        services.AddSingleton<IApiEnvironmentService>(sp => new ApiEnvironmentService(
            sp.GetRequiredService<ApiOptions>(),
            sp.GetRequiredService<IApiEnvironmentStore>(),
            LocalBaseUrl,
            DefaultEnvironment));
        services.AddSingleton<IAuthSession, SecureAuthSession>();
        services.AddSingleton<ApiRequestSender>();
        services.AddSingleton<IConnectivityService, MauiConnectivityService>();

        services.AddSingleton<IAuthApi, AuthApiClient>();
        services.AddSingleton<IDashboardApi, DashboardApiClient>();
        services.AddSingleton<ICattleApi, CattleApiClient>();
        services.AddSingleton<IAlertsApi, AlertsApiClient>();
        services.AddSingleton<ISyncEventsApi, SyncEventsApiClient>();

        services.AddSingleton<ISqliteConnectionProvider>(_ =>
            new SqliteConnectionProvider(Path.Combine(FileSystem.AppDataDirectory, "gyrmonitor-desktop.db3")));
        services.AddSingleton<IPendingEventRepository, SqlitePendingEventRepository>();
        services.AddSingleton<ISyncQueueRepository, SqliteSyncQueueRepository>();
        services.AddTransient<EventSimulatorService>();

        services.AddSingleton(sp => new DesktopSyncService(
            sp.GetRequiredService<ISyncQueueRepository>(),
            sp.GetRequiredService<IPendingEventRepository>(),
            sp.GetRequiredService<ISyncEventsApi>(),
            DesktopClientId,
            DesktopDeviceId));
    }

    private static void RegisterViewModels(IServiceCollection services)
    {
        services.AddTransient<LoginViewModel>();
        services.AddTransient<DashboardViewModel>();
        services.AddTransient<CattleViewModel>();
        services.AddTransient<AlertsViewModel>();
        services.AddTransient<EventSimulatorViewModel>();
        services.AddSingleton<SyncViewModel>();
        services.AddSingleton<ConnectivityStatusViewModel>();
    }

    private static void RegisterPages(IServiceCollection services)
    {
        services.AddTransient<AppShell>();
        services.AddTransient<LoginPage>();
        services.AddTransient<DashboardPage>();
        services.AddTransient<CattlePage>();
        services.AddTransient<AlertsPage>();
        services.AddTransient<EventSimulatorPage>();
        services.AddTransient<SyncPage>();
    }
}
