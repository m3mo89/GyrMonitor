# Mobile

.NET MAUI field application for GyrMonitor, generated as part of Phase 8 (`add-offline-sync`).

Source guidance:

- `knowledge-base/06-engineering/mobile/overview.md`
- `knowledge-base/06-engineering/mobile/maui-architecture.md`
- `knowledge-base/06-engineering/mobile/offline-storage.md`
- `knowledge-base/06-engineering/mobile/sync-client.md`

## Projects

- `GyrMonitor.Mobile.Core` — platform-agnostic class library (net10.0) with models, services, view models, SQLite repositories, and API clients. No MAUI dependency, so it can be unit tested without an emulator or the MAUI workload.
- `GyrMonitor.Mobile` — the generated `.NET MAUI` head project (Pages/XAML, `MauiProgram` DI wiring, platform adapters for `SecureStorage` and `Connectivity`). References `GyrMonitor.Mobile.Core`.
- `GyrMonitor.Mobile.Core.Tests` — xUnit tests for `GyrMonitor.Mobile.Core`.

## Features

- `Features/Authentication` — login against `POST /api/v1/auth/login`, session persisted via `SecureStorage`.
- `Features/Alerts` — cached alert list/detail (`LocalAlert` SQLite table), stale-data indicator when offline.
- `Features/Observations` — offline-capable observation capture (`PendingObservation` SQLite table), queued before any network call.
- `Features/Sync` — `SyncQueue` SQLite table and `MobileSyncService`, which posts pending observations to `POST /api/v1/sync/observations` with a stable `Idempotency-Key` derived from the batch contents.
- `Shared/Authorization` — role-based access helpers shared across mobile features.

## Build

```sh
dotnet build mobile/GyrMonitor.Mobile.Core/GyrMonitor.Mobile.Core.csproj
dotnet test mobile/GyrMonitor.Mobile.Core.Tests/GyrMonitor.Mobile.Core.Tests.csproj
dotnet build mobile/GyrMonitor.Mobile/GyrMonitor.Mobile.csproj -f net10.0-android
```

`GyrMonitor.Mobile` targets `net10.0-android` (and `net10.0-ios` on non-Linux hosts); Mac Catalyst is intentionally excluded from mobile (desktop-only, see `restrict-client-target-platforms`). Android/iOS targets require the corresponding platform SDKs in addition to the `maui` workload.

## Configuration

The backend base URL is environment-selectable at runtime, not a value you edit and rebuild for:

- **Debug builds** start on Local/Development (`http://10.0.2.2:3000` on the Android emulator, `http://127.0.0.1:3000` elsewhere) and show an environment picker on the login screen offering Local/Development, Staging, and Production. The selection is persisted (`SecureStorage`) across restarts.
- **Release builds** always start on Production and never render the picker — there is no way to point a Release build anywhere else.
- Once the current environment is Production (by selecting it in Debug, or by the Release default), the picker disappears in both cases — there is no in-app way back to Local/Staging from Production. Recovering requires clearing the app's persisted state (reinstall/clear app data).
- A logout action is available from any authenticated page (top-right of the title bar); logging out clears the session and returns to the login screen, where the environment can be changed again (unless it's already Production).

See `shared/GyrMonitor.Client.Core/Networking/ApiEnvironmentService.cs` and `ApiEnvironmentCatalog.cs` for the implementation, and `MauiProgram.cs` for the Local/Development default this head supplies.

### Local HTTP connectivity (gotcha)

Per [Microsoft's local-web-services guidance](https://learn.microsoft.com/en-us/dotnet/maui/data-cloud/local-web-services), Mac Catalyst (and Windows) apps can reach a local HTTP backend with no ATS exceptions needed — that requirement is iOS Simulator/Android-only. Use `ApiBaseUrl = "http://127.0.0.1:3000"`, not `"http://localhost:3000"` — Mac Catalyst can resolve `localhost` to the IPv6 loopback (`::1`), which the backend does not listen on (it binds `127.0.0.1` only). `Platforms/iOS/Info.plist` and `Platforms/Android/AndroidManifest.xml` still carry ATS/cleartext exceptions for when those targets are actually built.

### Launch crash on Apple Silicon, then "unable to reach the server" (gotcha)

Two related issues, both caused by code signing on Apple Silicon:

1. **Crash on launch.** `sqlite-net-pcl`'s native `libe_sqlite3.dylib` ships **unsigned** inside the app bundle. Apple Silicon refuses to `dyld`-load unsigned code into a process, so the app crashes immediately on launch with `Library not loaded: .../libe_sqlite3.dylib ... Trying to load an unsigned library`.
2. **"Unable to reach the server" after fixing (1).** Naively re-signing the bundle with `codesign --force --sign -` (no `--entitlements`) strips the `com.apple.security.network.client` entitlement that the default MAUI template applies. Mac Catalyst apps are sandboxed by default (`com.apple.security.app-sandbox`); without the network-client entitlement, every outbound request fails silently and every `HttpClient` call throws, which the UI reports as a generic "unable to reach the server" — no crash, no useful exception detail.

The `CodesignMacCatalystNativeLibraries` MSBuild target in `GyrMonitor.Mobile.csproj` fixes both: it ad-hoc signs every `.dylib` in `Contents/MonoBundle`, then re-signs the app bundle **with** `--entitlements "$(IntermediateOutputPath)Entitlements.xcent"` (the build-generated copy — the source `Platforms/MacCatalyst/Entitlements.plist` has a BOM that makes `codesign`'s XML parser fail with `AMFIUnserializeXML: syntax error`). This runs automatically after every `net10.0-maccatalyst` build. If you ever see either symptom again, verify entitlements survived:

```sh
codesign -d --entitlements - GyrMonitor.Mobile/bin/Debug/net10.0-maccatalyst/maccatalyst-arm64/GyrMonitor.Mobile.app
# expect com.apple.security.app-sandbox=true and com.apple.security.network.client=true
```
