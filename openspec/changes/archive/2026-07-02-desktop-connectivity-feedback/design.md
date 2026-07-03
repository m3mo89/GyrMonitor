## Context

`MauiConnectivityService` (`desktop/GyrMonitor.Desktop/Shared/Networking/MauiConnectivityService.cs`) wraps `Microsoft.Maui.Networking.Connectivity` and exposes `IsConnected` (a point-in-time read) plus a `ConnectivityRestored` event that only fires on the transition back to `NetworkAccess.Internet`. It is registered as a singleton (`services.AddSingleton<IConnectivityService, MauiConnectivityService>()`). `AppShell` (constructed once, effectively a singleton) subscribes to `ConnectivityRestored` and fires `DesktopSyncService.SyncPendingEventsAsync()` in the background with no result surfaced to the UI. `SyncViewModel.IsOffline` is a plain computed property (`=> !_connectivity.IsConnected`) evaluated once when the view model is constructed; `SyncViewModel` is registered `AddTransient`, so a fresh read happens each time the Sync tab is navigated to, but the value never updates while the user stays on that screen. No other screen surfaces connectivity state at all.

Two real gaps, both confirmed by reading the code (not simulated): (1) the offline banner is Sync-tab-only and stale while visible, (2) the automatic reconnect-triggered sync is silent.

Note: `IsConnected` reflects OS-level network reachability (`NetworkAccess.Internet`), not backend reachability specifically — a running network with a stopped backend still reports `IsConnected = true`. This design does not change that; it only makes the existing signal reactive and visible everywhere.

## Goals / Non-Goals

**Goals:**
- Any screen shows a live-updating indicator when the device has no network access, without needing to navigate away and back.
- The user gets a visible, unobtrusive confirmation when a sync run (automatic or manual) completes, including when it fails.
- Keep the change confined to the desktop client and the shared `GyrMonitor.Client.Core` networking abstraction; no backend/API changes.

**Non-Goals:**
- Detecting "backend reachable" specifically (still OS-level network access only) — a genuinely new capability, out of scope here.
- Retrying failed syncs on a timer/backoff schedule — connectivity-restore-triggered sync already exists and is unchanged in this regard.
- Redesigning the Sync tab's own layout beyond removing the now-redundant local banner.

## Decisions

**1. Add `event EventHandler<bool>? ConnectivityChanged` to `IConnectivityService`, fired on every transition (both lost and restored).**
`ConnectivityRestored` stays as-is (still used by `AppShell` to trigger auto-resync — that specific behavior only cares about the "came back" transition). `ConnectivityChanged` is the new, more general signal that UI state binds to. Alternative considered: have every view model subscribe directly to `Microsoft.Maui.Networking.Connectivity.Current.ConnectivityChanged`. Rejected — that ties platform-agnostic, unit-testable `GyrMonitor.Desktop.Core` view models to a MAUI-specific static API that can't be faked in `Core.Tests`; going through `IConnectivityService` keeps the existing test seam.

**2. Introduce a small singleton `ConnectivityStatusViewModel` in `GyrMonitor.Desktop.Core` that wraps `IConnectivityService` and exposes a reactive `IsOffline` (`[ObservableProperty]`).**
This is the one place that subscribes to `ConnectivityChanged` for the lifetime of the app (registered singleton, subscribes once in its constructor — never disposed, matching how `AppShell` already subscribes for the app's lifetime). `AppShell.xaml` binds a small `OfflineBannerView` (new `Shared/Controls/OfflineBannerView.xaml`, styled with the `desktop-ui-polish` card/badge system) to this view model, placed in Shell chrome so it's visible above whichever tab is active. `SyncPage` drops its local, non-reactive `IsOffline` binding/banner in favor of this shared one (avoids two sources of truth). Alternative considered: keep `IsOffline` on `SyncViewModel` and make every other page's view model independently subscribe to `ConnectivityChanged` too. Rejected — duplicates subscription/lifetime logic across five view models for a single piece of app-wide state.

**3. Change `SyncViewModel` registration from `AddTransient` to `AddSingleton` in `MauiProgram.cs`.**
`SyncViewModel` needs to react to `ConnectivityChanged`/sync-completed events for as long as the app runs, not just while the Sync tab is on screen. A transient view model re-subscribing on every navigation and never unsubscribing would leak a new event handler per visit. Making it a singleton (like `DesktopSyncService`, `IConnectivityService`, and `AppShell` already are) gives the subscription a single, well-defined lifetime. `SyncPage`'s constructor/`BindingContext` wiring is unaffected — DI still resolves the same registered instance either way. This is the one change flagged **BREAKING** internally in the proposal because it changes an existing DI lifetime, not because it changes any public contract.

**4. Surface sync completion via a `SyncCompleted` event on `DesktopSyncService`, raised at the end of `SyncPendingEventsAsync` with the `DesktopSyncSummary`.**
`AppShell` (and `SyncViewModel`, if additional in-page feedback is wanted) subscribe to it. A new small `Shared/Controls/SyncNotificationView.xaml` (auto-dismissing after ~4 seconds, reusing `BadgeStyle`/`CardStyle`) renders "Synced N pending events" / "Sync failed: <message>" at the Shell level, so it appears regardless of which tab triggered or received the sync. Alternative considered: route this through `MessagingCenter`/weak-event pub-sub instead of a plain C# event. Rejected — `DesktopSyncService` is already a singleton with a stable lifetime matching its only two subscribers (`AppShell`, optionally `SyncViewModel`); a plain event is simpler and this codebase does not otherwise use a messaging bus.

## Risks / Trade-offs

- [Risk] Making `SyncViewModel` a singleton means its transient UI state (e.g. a future per-visit "just refreshed" flag) would persist across navigations if ever added. → Mitigation: current `SyncViewModel` state (`PendingCount`, `IsBusy`, `StatusMessage`) is meant to reflect ongoing app state anyway, not per-visit UI state, so this is actually more correct; flag it in code comments only if a genuinely per-visit concern is added later.
- [Risk] A new `IConnectivityService.ConnectivityChanged` event adds a second event alongside the existing `ConnectivityRestored`, which could drift out of sync if only one is updated in future changes. → Mitigation: implement `ConnectivityRestored` in terms of `ConnectivityChanged` (raise both from the same `OnConnectivityChanged` handler) so there is one source of truth in `MauiConnectivityService`.
- [Risk] The auto-dismissing sync notification could be missed if it appears while the user is mid-interaction (e.g. typing in the Simulator). → Mitigation: keep the visible duration generous (~4s) and non-modal (doesn't block input); this is a nice-to-have confirmation, not a required acknowledgment.
- [Trade-off] Centralizing connectivity/sync feedback at the Shell level (vs. duplicating per-page) is one more shared control to build and merges two previously independent pieces of page-local state into shared singletons — slightly more upfront design, in exchange for a single correct implementation instead of five inconsistent ones.

## Migration Plan

Additive/behavioral, no data migration:
1. Add `ConnectivityChanged` to `IConnectivityService` and implement it in `MauiConnectivityService` (backward compatible — `ConnectivityRestored` keeps firing as before).
2. Add `ConnectivityStatusViewModel` and `OfflineBannerView`; wire into `AppShell.xaml`; remove the old Sync-tab-local banner/binding.
3. Add `SyncCompleted` to `DesktopSyncService`; add `SyncNotificationView`; wire into `AppShell`.
4. Switch `SyncViewModel` to `AddSingleton` in `MauiProgram.cs`.
Rollback is a plain revert of the affected files; no persisted data or wire-protocol changes are involved.

## Open Questions

- None blocking. Exact banner/notification copy ("You're offline", "Synced N pending events") is a small implementation-time detail, consistent with existing message tone in `SyncPage`/`LoginPage`.
