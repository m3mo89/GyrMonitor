## Context

Desktop and mobile both depend on `GyrMonitor.Client.Core.Networking.ApiOptions`, a single `required init` `BaseUrl` string registered once as a DI singleton in each head's `MauiProgram.CreateMauiApp()`:

```csharp
private const string ApiBaseUrl = "http://127.0.0.1:3000"; // mobile: 10.0.2.2 under #if ANDROID
...
services.AddSingleton(new ApiOptions { BaseUrl = ApiBaseUrl });
```

`ApiRequestSender.BuildUrl` reads `_options.BaseUrl` on every call (`{_options.BaseUrl}/{path}`), and every API path already includes the `/api/v1` prefix (e.g. `AuthApiClient` posts to `/api/v1/auth/login`). So `BaseUrl` is host+port only, not a full API base URL — unlike the frontend's `VITE_API_BASE_URL`, which does include `/api/v1`. Any new environment values must follow the client convention (no `/api/v1` suffix) to avoid a doubled prefix.

Because `ApiRequestSender` re-reads `_options.BaseUrl` on every request rather than caching it at construction, making `BaseUrl` a mutable property (instead of `init`-only) is enough for a runtime switch to take effect immediately — no need to rebuild the DI container or restart the app.

Both clients already have a working key-value persistence seam: `ISecureKeyValueStore` (backed by MAUI `SecureStorage`), used today for `SecureAuthSession`. Reusing it avoids introducing a second storage mechanism for one more small string.

## Goals / Non-Goals

**Goals:**

- Let a user pick Local/Development, Staging, or Production from the desktop/mobile login screen, at runtime, with no rebuild.
- Hide the picker entirely once the current environment is Production — there is no in-app way to leave Production once reached, in either a Debug or a Release build.
- Default Debug builds to Local/Development on first run (today's hardcoded behavior), and default Release builds to Production on first run, so a Release build never shows the picker at all (it starts already in the state that hides it).
- Persist the selection across app restarts (Debug builds only meaningfully change state here, since Release always starts on Production).
- Keep desktop's Mac Catalyst `127.0.0.1` requirement and mobile's Android `10.0.2.2` emulator loopback exactly as they work today for the Local/Development option.
- Share the environment model and persistence logic between desktop and mobile through `GyrMonitor.Client.Core`, consistent with the project's existing shared-core strategy.
- Keep Staging/Production URLs consistent with the values already documented in `docs/release/deployment-environments.md` for the web frontend/backend (same Railway hosts), adjusted to the client's host-only `BaseUrl` convention.
- Give both clients an explicit, user-initiated logout action, since "return to the login screen to change environments" (decision 4) is not a real capability without one.

**Non-Goals:**

- No change to the backend API, CORS policy, or API contract.
- No change to the frontend's existing build-time (`build-env.mjs`) environment mechanism.
- No support for an arbitrary/custom user-typed URL (e.g. a LAN IP for physical-device testing against a developer's machine) — out of scope for this change, can be a follow-up if needed.
- No mid-session environment switching while authenticated: the picker is only usable on the (unauthenticated) login screen, since a session token from one backend is not valid on another.
- No in-app way back from Production to Local/Staging — this is intentional (a one-way latch), not an oversight; recovering requires clearing the app's persisted environment value (e.g. clearing app data/reinstalling in Debug).

## Decisions

### 1. New shared `ApiEnvironment` enum + `ApiEnvironmentCatalog` in `GyrMonitor.Client.Core.Networking`

- `ApiEnvironment` is `{ Local, Staging, Production }`.
- `ApiEnvironmentCatalog` maps `Staging`/`Production` to their fixed host-only base URLs (`https://gyrmonitor-staging.up.railway.app`, `https://gyrmonitor-production.up.railway.app`). `Local` has no fixed value in the shared catalog — each MAUI head supplies its own local default (desktop: `http://127.0.0.1:3000`; mobile: `http://10.0.2.2:3000` under `#if ANDROID`, else `http://127.0.0.1:3000`), matching the platform-specific gotchas already documented in each README.
- All three enum members still exist in the shared model (Production is a real, resolvable environment) — what changes per decision 2 is which members are *reachable at runtime* depending on the build configuration.
- Alternative considered: hardcode all three URLs (including Local) in the shared catalog. Rejected because the Local value is platform/head-specific (Android emulator vs. desktop loopback), and the shared core has no `#if ANDROID`/head context — keeping that branch in each `MauiProgram` (as today) avoids leaking platform conditionals into the shared core.

### 2. One `IApiEnvironmentService` implementation; only the starting environment is build-conditional

- `IApiEnvironmentService` exposes `CurrentEnvironment`, `AvailableEnvironments` (always `{ Local, Staging, Production }`), and `SetEnvironmentAsync(ApiEnvironment)`. There is a single implementation — no `#if DEBUG`/`#else` split in the service itself.
- The only build-conditional piece is the *default* environment used when nothing is persisted yet, via one small `#if DEBUG` constant (mirroring the existing `#if DEBUG builder.Logging.AddDebug()` gate in each `MauiProgram.cs`): Debug defaults to `Local`, Release defaults to `Production`. This directly satisfies "a Debug compile is always considered dev, a Release compile is always considered prod" as a *starting point*, not a hard-coded ceiling.
- `SetEnvironmentAsync` always accepts any of the three values and persists the choice via `IApiEnvironmentStore` (decision 3) — including in a Release build, since nothing prevents the underlying capability from existing; what actually prevents a Release build from ever leaving Production is that its default start is already Production, and decision 4's picker-visibility rule means no UI ever offers `SetEnvironmentAsync(Local)`/`SetEnvironmentAsync(Staging)` once the current environment is Production. This is intentionally a single mechanism (visibility rule) rather than two separate mechanisms (a build-locked service *and* a hidden picker), since an earlier iteration of this design tried compiling `SetEnvironmentAsync` out of Release entirely and turned out to disagree with the actual requirement: Debug builds must also be able to reach Production.
- `ApiOptions.BaseUrl` changes from `required init` to a plain mutable `get; set;` so any environment switch updates it live, in either build configuration.
- Alternative considered (previous iteration of this design): compile out `SetEnvironmentAsync` entirely in Release via `#if DEBUG`, and limit Debug's `AvailableEnvironments` to `{ Local, Staging }`. Rejected after clarifying the actual requirement — Debug builds must be able to reach Production, so the "no switching away from Production" guarantee has to come from the picker being hidden once *any* build (Debug or Release) is on Production, not from either build lacking the capability altogether.

### 3. `IApiEnvironmentStore` persists the selection through the existing `ISecureKeyValueStore`

- New `IApiEnvironmentStore` interface with `GetAsync()`/`SetAsync(ApiEnvironment)`, implemented in `GyrMonitor.Client.Core` using the already-injected `ISecureKeyValueStore` under a new key (`gyrmonitor.api-environment`). Not a secret, but reusing the existing store avoids adding a second (MAUI `Preferences`-based) persistence path per head.
- An unrecognized or missing stored value resolves to the build-conditional default from decision 2 (`Local` in Debug, `Production` in Release).
- Once a value of `Production` is persisted (by either build), it is read back as `Production` on the next launch — there is no special-casing that resets it back to `Local`/`Staging`, since reaching Production and staying there is the intended one-way behavior.

### 4. Login-screen environment picker, visible only while the current environment is not Production

- Each client's `LoginViewModel` gains `AvailableEnvironments`, `SelectedEnvironment` (two-way bound to a MAUI `Picker`), and a computed `IsEnvironmentPickerVisible` = `CurrentEnvironment != ApiEnvironment.Production`. This single rule, evaluated identically in both build configurations, is what makes a Release build (which starts on Production) never show the picker, and what makes a Debug build's picker disappear the moment the user selects Production.
- Changing the selection while not busy immediately calls `SetEnvironmentAsync`; the login button uses whatever `ApiOptions.BaseUrl` is current at submit time.
- The picker also only lives on `LoginPage` (desktop and mobile) — once authenticated there is no exposed way to switch environments without logging out first, independent of the Production-visibility rule.
- Labels are localized via the existing `AppStrings` resx mechanism (Local/Development, Staging, Production — Spanish strings alongside existing UI localization work).
- **Implementation note (found during implementation):** `AvailableEnvironmentOptions` (the Picker's `ItemsSource`) is populated once in the constructor and never cleared/rebuilt afterward, since the set of three environments never changes — only which one is selected. An earlier version rebuilt this `ObservableCollection` (`Clear()` + re-`Add()`) every time the environment changed; because that rebuild happened synchronously inside the callback chain triggered by the Picker's own `SelectedItem` change, it crashed the native Picker on both platforms (a known MAUI/iOS class of bug: mutating a control's `ItemsSource` reentrantly from within its own selection-changed handling). Switching environments now only ever updates `SelectedEnvironmentOption` and `IsEnvironmentPickerVisible` — the item collection itself is stable.

### 5. Logout: a button in each Shell's `TitleView`, reusing the existing session-clear/navigate pattern

- Both clients already have the `SessionExpired`-triggered pattern for returning to login (`AppShell.OnSessionExpired`: `MainThread.BeginInvokeOnMainThread(async () => await GoToAsync($"//{Routes.Login}"))`), but that path only fires automatically after a `401` and relies on `ApiRequestSender` having already called `_authSession.ClearAsync()`. Logout needs the same navigation, triggered by the user, with an explicit `ClearAsync()` call first (there is no `401` to trigger it).
- Desktop's `AppShell.xaml` already defines a `Shell.TitleView` (a `Grid` hosting `PageTitleLabel`, `OfflineBannerView`, `SyncNotificationView`) that appears above every authenticated tab. Add a logout `Button`/icon to that same `Grid`. Mobile's `AppShell.xaml` has no `Shell.TitleView` yet — add one, mirroring desktop's, so both clients gain a consistent, always-visible logout affordance instead of inventing two different patterns.
- `AppShell.xaml.cs` on both clients already accepts `IAuthSession` (mobile) or can trivially add it (desktop, alongside its existing `IConnectivityService`/`DesktopSyncService` constructor parameters) — the logout handler is `await _authSession.ClearAsync(); await GoToAsync($"//{Routes.Login}");`, guarded so it's only reachable when `CurrentPage` is not already the login route (Shell hides/disables it there, mirroring how the picker itself is only meaningful pre-authentication).
- Alternative considered: a `LogoutCommand` on every feature `ViewModel` (Dashboard/Cattle/Alerts/etc.), so each page's own toolbar carries a "Logout" `ToolbarItem`. Rejected — duplicates the same command across every ViewModel/page for no benefit, when the Shell-level `TitleView` already renders once per authenticated tab and both clients already have (desktop) or can trivially get (mobile) the same infrastructure.
- Alternative considered: reuse `AuthenticationEvents.RaiseSessionExpired()` to trigger logout (since `AppShell` already listens for it and navigates). Rejected — that event's name and existing semantics are "the backend rejected the token," which is a different condition than "the user chose to sign out"; conflating them would make a future need to distinguish the two (e.g. different messaging) harder to add later.

## Risks / Trade-offs

- **[Trade-off, intentional]** Once any build reaches Production, there is no in-app way back to Local/Staging — recovering requires clearing the persisted `gyrmonitor.api-environment` value (app data reset/reinstall). This is the explicit requirement (picker hidden in Production), not an oversight; documented in both READMEs so it isn't mistaken for a bug during Debug-build QA against Production.
- **[Risk]** Forgetting the client `BaseUrl` convention (host-only, no `/api/v1`) when adding Staging/Production entries would double the prefix and silently 404 → **Mitigation**: unit test asserts each catalog entry has no trailing `/api/v1` and that a resolved request URL matches the expected shape for each environment.
- **[Risk]** Physical-device testing (a real phone hitting a developer's LAN IP) isn't covered by any of the three fixed options → **Mitigation**: explicitly a non-goal; documented as a known gap in `desktop/README.md`/`mobile/README.md` (developers can still hardcode a value locally for that case, same as today).
- **[Risk]** A Debug build side-loaded onto a real device is not prevented from reaching Production → **Mitigation**: out of scope for this change (the requirement explicitly asks for Debug builds to reach Production); side-loaded Debug builds reaching real Production data is a distribution-hygiene concern independent of this picker.

## Migration Plan

- Additive for Debug builds: default behavior after the change is identical to today (Local/Development, same URLs) for anyone who never opens the picker.
- New behavior for Release builds: today there is no distinct Release build/distribution pipeline for desktop or mobile, so defaulting Release to Production is a new guarantee rather than a change to an existing behavior — nothing regresses because nothing currently relies on a Release build reaching a non-Production backend.
- No data migration; `IApiEnvironmentStore` simply has no stored value on first run for existing installs, which resolves to the build-conditional default (`Local` in Debug, `Production` in Release).
- Rollback is a plain revert of the shared core, desktop, and mobile changes — no backend/database/deployment impact.

## Open Questions

- None outstanding; custom/LAN-IP environment entry is explicitly deferred (see Non-Goals).
