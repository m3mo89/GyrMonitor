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

## Build

```sh
dotnet build mobile/GyrMonitor.Mobile.Core/GyrMonitor.Mobile.Core.csproj
dotnet test mobile/GyrMonitor.Mobile.Core.Tests/GyrMonitor.Mobile.Core.Tests.csproj
dotnet build mobile/GyrMonitor.Mobile/GyrMonitor.Mobile.csproj -f net10.0-maccatalyst
```

Android/iOS targets require the corresponding platform SDKs in addition to the `maui` workload.

## Configuration

The backend base URL is set in `MauiProgram.ApiBaseUrl` (defaults to `http://localhost:3000`, matching the backend's default port). Update it for device/emulator testing against a non-local backend.
