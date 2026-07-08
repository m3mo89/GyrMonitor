## Why

Desktop and mobile currently hardcode the backend `ApiBaseUrl` as a compile-time constant in `MauiProgram.cs` (`http://127.0.0.1:3000`, with a `10.0.2.2` special case for the Android emulator). Testing against staging or production today means editing source and rebuilding, which is error-prone and does not match how the frontend already supports development/staging/production (`docs/release/deployment-environments.md`, `frontend/scripts/build-env.mjs`). Desktop and mobile need a runtime picker so a developer/tester can point a build at Local/Development, Staging, or Production — but once the app is actually pointed at Production, the picker must disappear, so nobody can casually flip a production-connected session back to a lower environment (or, symmetrically, a Release build — which always starts on Production — never shows the picker at all).

Because the environment picker only lives on the login screen, "changing environments requires returning to the login screen" is only a real capability if there is a way to return to the login screen. Neither client currently has a logout action — the only existing path back to the login route is an automatic one (`AuthenticationEvents.SessionExpired`, fired on a `401`). This change adds an explicit, user-initiated logout to both clients so the environment picker's design is actually usable, not just theoretically reachable.

## What Changes

- Add a shared, testable environment abstraction in `GyrMonitor.Client.Core` that models the three known backends (Local/Development `http://127.0.0.1:3000/api/v1` with the existing Android `10.0.2.2` loopback case, Staging `https://gyrmonitor-staging.up.railway.app/api/v1`, Production `https://gyrmonitor-production.up.railway.app/api/v1`).
- Make `ApiOptions.BaseUrl` reflect the resolved environment instead of an `init`-only constant, so switching environments takes effect without recompiling.
- Add a login-screen environment picker offering all three environments, visible **only while the current environment is not Production**. Once Production is selected (or is the starting environment), the picker is not rendered — there is no in-app way back to Local/Staging from Production.
- **Debug builds** (`#if DEBUG`, mirroring the existing `builder.Logging.AddDebug()` gate): default to Local/Development on first run, so the picker is visible and offers all three options, and persist the selection across app restarts.
- **Release builds**: always start on Production, so the login-screen picker never renders — Production is reached by default, not by user choice, in a Release build.
- Update `desktop/README.md` and `mobile/README.md` configuration notes, and `docs/release/deployment-environments.md`, to document the in-app environment picker and its Production-hides-the-picker rule, replacing "edit `MauiProgram.ApiBaseUrl` and rebuild."
- Add a logout action to the desktop and mobile clients, reachable from any authenticated page, that clears the persisted session (via the existing `IAuthSession.ClearAsync()`) and returns to the login screen — where the environment picker becomes available again (unless the environment is Production).
- Not changing: the backend API contract, CORS configuration, or the frontend's existing build-time environment mechanism.

## Capabilities

### New Capabilities

(none — this extends existing client and deployment capabilities rather than introducing a new domain)

### Modified Capabilities

- `maui-shared-client-core`: the shared core gains a runtime-selectable, persisted API environment (Local/Development, Staging, Production) that both clients consume instead of a fixed `ApiOptions.BaseUrl`; Debug builds default to Local/Development, Release builds default to (and cannot leave) Production.
- `desktop-client`: desktop login gains an environment picker offering all three environments, hidden whenever the current environment is Production; the desktop workspace gains a logout action that clears the session and returns to the login screen.
- `mobile-client`: same as desktop, respecting the existing Android emulator loopback default for the Local/Development option, plus the same logout action for the mobile workflow.
- `deployment-environments`: the environment matrix and verification docs extend to cover desktop/mobile client targets, documenting the in-app picker and its Production-hides-the-picker rule alongside the existing frontend/backend build-time matrix.

## Impact

- Affects `shared/GyrMonitor.Client.Core/Networking/ApiOptions.cs`, plus new environment store/selection types in `GyrMonitor.Client.Core` and their unit tests. Reuses the existing `IAuthSession.ClearAsync()` for logout — no new shared session-clearing API needed.
- Affects `desktop/GyrMonitor.Desktop/MauiProgram.cs`, `desktop/GyrMonitor.Desktop/Features/Authentication/*` (LoginPage/LoginViewModel), `desktop/GyrMonitor.Desktop/Shared/Storage/SecureStorageKeyValueStore.cs` usage, and `desktop/GyrMonitor.Desktop/AppShell.xaml`/`AppShell.xaml.cs` (logout control + handler).
- Affects `mobile/GyrMonitor.Mobile/MauiProgram.cs`, `mobile/GyrMonitor.Mobile/Features/Authentication/*` (LoginPage/LoginViewModel), the equivalent mobile storage wiring, and `mobile/GyrMonitor.Mobile/AppShell.xaml`/`AppShell.xaml.cs` (logout control + handler).
- Affects `desktop/README.md`, `mobile/README.md`, `docs/release/deployment-environments.md`, and `knowledge-base/07-reference/configuration.md`.
- Does not affect the backend, the frontend build pipeline, or the API contract.
