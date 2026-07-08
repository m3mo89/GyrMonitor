## Why

The desktop client has no reliable way to tell an administrator that it has lost connectivity to the backend, or that queued events synced automatically once connectivity returned. Today, an offline indicator only exists on the Sync tab, it is bound to a plain (non-reactive) property that never updates while the user is looking at the screen, and the automatic re-sync triggered on reconnect (`AppShell.OnConnectivityRestored`) runs silently with no visible confirmation. An administrator working through Dashboard, Cattle, or Alerts has no way to know the app is currently offline, and after connectivity returns has no way to know whether their simulated events actually made it to the server without manually opening the Sync tab and refreshing.

## What Changes

- Make connectivity state reactive: extend the shared `IConnectivityService` with a `ConnectivityChanged` event that fires on both loss and restoration (not just restoration), so bound UI updates live instead of only reflecting the state at the time a screen was opened.
- Add a persistent, app-wide "You're offline" banner shown from Shell chrome (visible from any tab: Dashboard, Cattle, Alerts, Sync, Simulator), replacing the Sync-tab-only banner, so administrators always know when they've lost connectivity and can keep working (existing screens keep functioning; writes still queue locally via the simulator).
- Surface the result of the automatic background sync that runs on reconnect: show a brief, auto-dismissing confirmation (e.g. "Synced 3 pending events") when `DesktopSyncService` completes a run, whether triggered automatically on reconnect or manually from the Sync tab.
- Change `SyncViewModel` (and any other view model that needs live connectivity state) from constructor-computed properties to reactive `[ObservableProperty]`-backed state kept in sync via the new `ConnectivityChanged` event.
- **BREAKING** (internal only): `SyncViewModel` registration changes from transient to singleton in `MauiProgram.cs` so its event subscription to `IConnectivityService` has a single, well-defined lifetime tied to the app instead of leaking a new subscriber on every tab navigation.

No changes to the sync wire protocol, idempotency behavior, or backend endpoints — this is entirely about desktop-client visibility into connectivity and sync outcomes.

## Capabilities

### Modified Capabilities

- `desktop-client`: Adds requirements for an app-wide, live-updating offline indicator and for surfacing background sync completion/failure to the user, replacing the current Sync-tab-only, non-reactive offline banner.

## Impact

- Affected code: `shared/GyrMonitor.Client.Core/Networking/IConnectivityService.cs`, `desktop/GyrMonitor.Desktop/Shared/Networking/MauiConnectivityService.cs`, `desktop/GyrMonitor.Desktop.Core/Features/Sync/SyncViewModel.cs`, `desktop/GyrMonitor.Desktop.Core/Features/Sync/DesktopSyncService.cs`, `desktop/GyrMonitor.Desktop/AppShell.xaml(.cs)`, `desktop/GyrMonitor.Desktop/Features/Sync/SyncPage.xaml`, `desktop/GyrMonitor.Desktop/MauiProgram.cs`.
- New shared UI element: an app-wide offline banner and a transient sync-result notification, both hosted at the Shell level so they're visible regardless of the active tab.
- No backend or API changes.
