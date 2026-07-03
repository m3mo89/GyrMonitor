## 1. Reactive connectivity signal

- [x] 1.1 Add `event EventHandler<bool>? ConnectivityChanged` to `IConnectivityService` (`shared/GyrMonitor.Client.Core/Networking/IConnectivityService.cs`)
- [x] 1.2 Update `MauiConnectivityService` to raise `ConnectivityChanged` (with the new `NetworkAccess` state) from its existing `OnConnectivityChanged` handler, and raise `ConnectivityRestored` from that same handler so both events share one source of truth
- [x] 1.3 Add/update a fake `IConnectivityService` test double in `GyrMonitor.Desktop.Core.Tests` that can raise `ConnectivityChanged` on demand, for use by new view model tests

## 2. App-wide offline indicator

- [x] 2.1 Add `ConnectivityStatusViewModel` (singleton) to `GyrMonitor.Desktop.Core` wrapping `IConnectivityService`, exposing a reactive `[ObservableProperty] bool IsOffline` initialized from `!IsConnected` and updated via `ConnectivityChanged`
- [x] 2.2 Register `ConnectivityStatusViewModel` as a singleton in `MauiProgram.cs`
- [x] 2.3 Create `Shared/Controls/OfflineBannerView.xaml` (+ code-behind) styled with the existing `CardStyle`/semantic brushes, bound to `ConnectivityStatusViewModel.IsOffline`
- [x] 2.4 Add `OfflineBannerView` to `AppShell.xaml` so it renders above the active tab regardless of which `ShellContent` is selected — implemented via `Shell.TitleView` (swaps with the page title in the same nav-bar row, since Shell's XAML content model doesn't support a free chrome slot outside TitleView/Flyout)
- [x] 2.5 Remove the old Sync-tab-local offline `Label`/binding from `SyncPage.xaml` in favor of the shared banner (also removed the now-dead `SyncViewModel.IsOffline` property and its unused `IConnectivityService` dependency)

## 3. Sync completion feedback

- [x] 3.1 Add `event EventHandler<DesktopSyncSummary>? SyncCompleted` to `DesktopSyncService`, raised at the end of `SyncPendingEventsAsync` (both the success and exception paths) with the resulting summary
- [x] 3.2 Create `Shared/Controls/SyncNotificationView.xaml` (+ code-behind) that renders a summary message ("Synced N pending events" / "Sync failed: <message>") and auto-dismisses after ~4 seconds
- [x] 3.3 Wire `AppShell` to subscribe to `DesktopSyncService.SyncCompleted` and surface `SyncNotificationView` at the Shell level for both the automatic reconnect sync and any manually triggered sync — placed in the same `Shell.TitleView` stack as the offline banner (no free-floating overlay slot exists in Shell's XAML content model); skips showing anything when the run had nothing to report (0 synced/duplicated/failed and no error)
- [x] 3.4 Verify the manual "Sync now" flow on the Sync tab still updates `SyncViewModel.StatusMessage` as before, in addition to the new shell-level notification — `SyncViewModel.SyncNowAsync` still reads the same `DesktopSyncSummary` return value unchanged; confirmed by code inspection, to be re-confirmed in build/test pass

## 4. SyncViewModel lifetime fix

- [x] 4.1 Change `SyncViewModel` registration in `MauiProgram.cs` from `AddTransient` to `AddSingleton`
- [x] 4.2 Confirm `SyncPage` still resolves and binds correctly with the singleton `SyncViewModel` (no per-navigation state assumptions broken) — `SyncPage` stays `AddTransient` (new page per navigation) with `BindingContext` set to the shared singleton VM; `OnAppearing` still calls `RefreshPendingCountCommand` each time, so the pending count refreshes on every visit regardless of VM lifetime

## 5. Tests

- [x] 5.1 Add a unit test asserting `MauiConnectivityService`-equivalent behavior (or the shared fake) raises `ConnectivityChanged` for both loss and restoration transitions
- [x] 5.2 Add a unit test for `ConnectivityStatusViewModel` asserting `IsOffline` updates when the underlying `IConnectivityService` raises `ConnectivityChanged`
- [x] 5.3 Add a unit test for `DesktopSyncService` asserting `SyncCompleted` fires with the correct summary on both success and failure paths (also covers the no-op "nothing pending" path)
- [x] 5.4 Run `GyrMonitor.Desktop.Core.Tests` and confirm all tests pass, including the new ones — 23/23 passed (16 pre-existing + 7 new)

## 6. Verification

- [x] 6.1 Build the desktop app (`dotnet build -f net10.0-maccatalyst`) and confirm no XAML/binding errors — build succeeded; also launched the built binary directly and caught a real startup crash (`XamlParseException: StaticResource not found for key StatusPendingBrush`), root-caused to `App(AppShell shell)` constructor-injecting `AppShell` before `App.InitializeComponent()` populated `Application.Current.Resources`. Fixed by resolving `AppShell` lazily in `CreateWindow` instead (`App.xaml.cs`). Re-verified: app now launches and stays running with no exceptions in the log.
- [x] 6.2 Manually toggle network access (e.g. Wi-Fi off/on) while on a non-Sync tab and confirm the offline banner appears/disappears live — confirmed working by the user
- [x] 6.3 Manually generate a simulated event while offline, restore connectivity, and confirm the sync-completion notification appears without opening the Sync tab — confirmed working by the user
- [x] 6.4 Confirm the Sync tab's existing pending-count/status-message behavior still works after the `SyncViewModel` singleton change — confirmed via the `DesktopSyncServiceTests`/`ConnectivityStatusViewModelTests` unit tests (23/23 passing) and code review of `SyncPage.xaml.cs`/`SyncViewModel`; no behavior depends on transient-vs-singleton lifetime
