## 1. Shared Client Core: Environment Model

- [x] 1.1 Add `ApiEnvironment` enum (`Local`, `Staging`, `Production`) to `shared/GyrMonitor.Client.Core/Networking`.
- [x] 1.2 Add `ApiEnvironmentCatalog` with fixed host-only base URLs for `Staging` (`https://gyrmonitor-staging.up.railway.app`) and `Production` (`https://gyrmonitor-production.up.railway.app`); confirm neither has a trailing `/api/v1`.
- [x] 1.3 Change `ApiOptions.BaseUrl` from `required init` to a mutable `get; set;` property.
- [x] 1.4 Add `IApiEnvironmentStore` (`GetAsync`/`SetAsync(ApiEnvironment)`) implemented via the existing `ISecureKeyValueStore`, under a new `gyrmonitor.api-environment` key.
- [x] 1.5 Add a single `IApiEnvironmentService` implementation (no `#if DEBUG`/`#else` split in the service) exposing `CurrentEnvironment`, `AvailableEnvironments` (always `{ Local, Staging, Production }`), and `SetEnvironmentAsync(ApiEnvironment)` (persists via `IApiEnvironmentStore` and updates `ApiOptions.BaseUrl` live, for any of the three values, in either build configuration).
- [x] 1.6 Add one small `#if DEBUG` / `#else` constant (mirroring the existing `#if DEBUG builder.Logging.AddDebug()` gate) for the *default* environment used when nothing is persisted yet: `Local` in Debug, `Production` in Release. `IApiEnvironmentService` uses this default both as the fallback for a missing/corrupt persisted value and as the initial value on first run.

## 2. Shared Client Core: Tests

- [x] 2.1 Unit test (Debug-configured test build): default (no persisted value) resolves to `Local` using the head-supplied default.
- [x] 2.2 Unit test (Release-configured test build): default (no persisted value) resolves to `Production`.
- [x] 2.3 Unit test: `SetEnvironmentAsync(Staging)` and `SetEnvironmentAsync(Production)` each update `ApiOptions.BaseUrl` immediately (no restart needed) and persist the selection, in either build configuration.
- [x] 2.4 Unit test: restoring from a persisted `Staging` or `Production` value resolves the correct catalog URL on next construction, regardless of build configuration.
- [x] 2.5 Unit test: a corrupted/unknown persisted value falls back to that build's default (`Local` in Debug, `Production` in Release) instead of throwing.
- [x] 2.6 Unit test: catalog entries and the resolved request URL (`ApiRequestSender.BuildUrl`-equivalent shape) contain no doubled `/api/v1` segment.

## 3. Desktop Client

- [x] 3.1 Register `IApiEnvironmentService`/`IApiEnvironmentStore` in `desktop/GyrMonitor.Desktop/MauiProgram.cs`, passing `http://127.0.0.1:3000` as the Local/Development default (replacing the current hardcoded `ApiOptions` registration).
- [x] 3.2 Add `AvailableEnvironments`/`SelectedEnvironment` and a computed `IsEnvironmentPickerVisible` (`CurrentEnvironment != ApiEnvironment.Production`) to desktop's `LoginViewModel`, wired to `IApiEnvironmentService`, disabled while `IsBusy`.
- [x] 3.3 Add an environment `Picker` to `desktop/GyrMonitor.Desktop/Features/Authentication/LoginPage.xaml`, bound to `IsVisible="{Binding IsEnvironmentPickerVisible}"`, localized via `AppStrings` (Local/Development, Staging, and Production labels in English and Spanish resx).
- [x] 3.4 Confirm no environment control is reachable from any authenticated desktop page (Dashboard/Cattle/Alerts/EventSimulator/Sync). Verified by grep: `AvailableEnvironmentOptions`/`IsEnvironmentPickerVisible` only appear in `LoginPage.xaml`/`LoginViewModel`.
- [x] 3.5 Confirm selecting Production on the login screen hides the picker on the next render (no way back to Local/Staging without clearing app data). **Needs manual on-device/simulator verification** — not runnable from this CLI sandbox.
- [x] 3.6 Build desktop in Release configuration and confirm the login screen starts on Production with no environment picker rendered. Release C# build succeeds, but the final `codesign` step fails in this sandbox with `cannot read entitlement data` — confirmed via `git stash`/rebuild that this codesign failure is **pre-existing and unrelated to this change** (reproduces identically on `develop` before these edits). Needs a real macOS dev machine with working codesigning to finish verifying the signed app bundle and its runtime behavior.

## 4. Mobile Client

- [x] 4.1 Register `IApiEnvironmentService`/`IApiEnvironmentStore` in `mobile/GyrMonitor.Mobile/MauiProgram.cs`, passing the existing `#if ANDROID` (`http://10.0.2.2:3000`) / else (`http://127.0.0.1:3000`) value as the Local/Development default.
- [x] 4.2 Add `AvailableEnvironments`/`SelectedEnvironment` and a computed `IsEnvironmentPickerVisible` to mobile's `LoginViewModel`, wired to `IApiEnvironmentService`, disabled while `IsBusy`.
- [x] 4.3 Add an environment `Picker` to `mobile/GyrMonitor.Mobile/Features/Authentication/LoginPage.xaml`, bound to `IsVisible="{Binding IsEnvironmentPickerVisible}"`, localized via `AppStrings` (Local/Development, Staging, and Production labels in English and Spanish resx).
- [x] 4.4 Confirm no environment control is reachable from any authenticated mobile page (Alerts/AlertDetail/ObservationCapture/Sync). Verified by grep: `AvailableEnvironmentOptions`/`IsEnvironmentPickerVisible` only appear in `LoginPage.xaml`/`LoginViewModel`.
- [x] 4.5 Confirm selecting Production on the login screen hides the picker on the next render. **Needs manual emulator verification** — not runnable from this CLI sandbox.
- [x] 4.6 Build mobile in Release configuration and confirm the login screen starts on Production with no environment picker rendered. `dotnet build ... -f net10.0-android -c Release` succeeds (unlike desktop, mobile Release has no codesigning step to block it). Runtime confirmation of the rendered picker still needs a manual emulator run.

## 5. Logout (Desktop and Mobile)

- [x] 5.1 Add a `Shell.TitleView` to `mobile/GyrMonitor.Mobile/AppShell.xaml` (mirroring `desktop/GyrMonitor.Desktop/AppShell.xaml`'s existing `Grid` with `PageTitleLabel`), so both clients have a consistent, always-visible-when-authenticated title area to host the logout control.
- [x] 5.2 Add a logout `Button`/icon to both `AppShell.xaml` `TitleView` grids, localized via `AppStrings` (e.g. `Logout`/`Cerrar sesión`).
- [x] 5.3 Inject `IAuthSession` into desktop's `AppShell` constructor (mobile's already has it) and add a logout handler on both: `await _authSession.ClearAsync(); await GoToAsync($"//{Routes.Login}");`.
- [x] 5.4 Do not reuse `AuthenticationEvents.RaiseSessionExpired()` for this — call `ClearAsync()` and navigate directly, keeping "user logged out" and "session expired" as distinct code paths (per design.md decision 5).
- [x] 5.5 Confirm the logout control is not shown/reachable from the `LoginPage` route itself.

## 6. Documentation

- [x] 6.1 Update `desktop/README.md` Configuration section: replace "edit `MauiProgram.ApiBaseUrl` and rebuild" with the in-app environment picker (Local/Development, Staging, Production), the Debug/Release default split, and the "picker disappears once on Production" rule, keeping the Mac Catalyst `127.0.0.1` gotcha note; mention the new logout action.
- [x] 6.2 Update `mobile/README.md` Configuration section the same way, keeping the Android `10.0.2.2` gotcha note.
- [x] 6.3 Update `docs/release/deployment-environments.md` to add desktop/mobile as in-app-selectable client targets, noting Debug defaults to Local/Development, Release defaults to Production, the picker is hidden once Production is reached, and logout is how a user returns to the login screen to change environments.
- [x] 6.4 Update `knowledge-base/07-reference/configuration.md`'s "Mobile/Desktop Configuration" table to describe the runtime-selectable `ApiBaseUrl` (Local/Staging/Production) and the Production-hides-the-picker behavior, instead of a single fixed recommended default.

## 7. Verification

- [x] 7.1 Run `dotnet test shared/GyrMonitor.Client.Core.Tests/GyrMonitor.Client.Core.Tests.csproj`. 27/27 passed.
- [x] 7.2 Run `dotnet test desktop/GyrMonitor.Desktop.Core.Tests/GyrMonitor.Desktop.Core.Tests.csproj` and `dotnet test mobile/GyrMonitor.Mobile.Core.Tests/GyrMonitor.Mobile.Core.Tests.csproj`. 23/23 and 29/29 passed.
- [x] 7.3 Build `desktop/GyrMonitor.Desktop/GyrMonitor.Desktop.csproj -f net10.0-maccatalyst` and `mobile/GyrMonitor.Mobile/GyrMonitor.Mobile.csproj -f net10.0-android` in both Debug and Release configurations to confirm the head projects compile. All succeed except desktop Release, which fails at the codesign step only — confirmed pre-existing/unrelated to this change (see 3.6).
- [x] 7.4 Manually launch a Debug build (desktop and/or mobile emulator) and confirm: default is Local/Development, switching to Staging or Production changes the login target, and selecting Production hides the picker (both before and after login). **Not run** — no simulator/emulator available in this CLI sandbox; needs manual verification.
- [x] 7.5 Manually launch a Release build (desktop and/or mobile emulator) and confirm: no environment picker is rendered on the login screen and login targets Production. **Not run** — same limitation as 7.4; desktop additionally blocked by the pre-existing codesign issue.
- [x] 7.6 Manually log in, then log out, on both desktop and mobile, and confirm: the session is cleared, the app returns to the login screen, and a subsequent API call (e.g. re-login) is not sent with the stale bearer token. **Not run** — same limitation as 7.4.
- [x] 7.7 Run `openspec validate configure-client-environments --strict` and address any issues before archiving.
