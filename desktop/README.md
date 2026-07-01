# Desktop

.NET MAUI administrative/simulation application for GyrMonitor, generated as part of Phase 8 (`add-offline-sync`).

Source guidance:

- `knowledge-base/06-engineering/desktop/overview.md`
- `knowledge-base/06-engineering/desktop/maui-desktop.md`
- `knowledge-base/06-engineering/desktop/event-simulator.md`

## Projects

- `GyrMonitor.Desktop.Core` — platform-agnostic class library (net10.0) with models, services, view models, SQLite repositories, and API clients. No MAUI dependency, so it can be unit tested without an emulator or the MAUI workload.
- `GyrMonitor.Desktop` — the generated `.NET MAUI` head project (Pages/XAML, `MauiProgram` DI wiring, platform adapters for `SecureStorage` and `Connectivity`). References `GyrMonitor.Desktop.Core`.
- `GyrMonitor.Desktop.Core.Tests` — xUnit tests for `GyrMonitor.Desktop.Core`.

## Features

- `Features/Authentication` — login against `POST /api/v1/auth/login`, session persisted via `SecureStorage`.
- `Features/Dashboard` — read-only view of `GET /api/v1/dashboard`, no local recalculation.
- `Features/Cattle` — read-only cattle list from `GET /api/v1/cattle`.
- `Features/Alerts` — read-only alert list from `GET /api/v1/alerts`.
- `Features/EventSimulator` — generates activity/inactivity events tagged `DESKTOP_SIMULATOR`, always persisted offline-first (`PendingEvent` SQLite table) before being queued for sync, isolated from any direct call to the production `POST /api/v1/events` endpoint.
- `Features/Sync` — `SyncQueue` SQLite table and `DesktopSyncService`, which posts pending events to `POST /api/v1/sync/events` with a stable `Idempotency-Key` derived from the batch contents.

## Build

```sh
dotnet build desktop/GyrMonitor.Desktop.Core/GyrMonitor.Desktop.Core.csproj
dotnet test desktop/GyrMonitor.Desktop.Core.Tests/GyrMonitor.Desktop.Core.Tests.csproj
dotnet build desktop/GyrMonitor.Desktop/GyrMonitor.Desktop.csproj -f net10.0-maccatalyst
```

## Configuration

The backend base URL is set in `MauiProgram.ApiBaseUrl` (defaults to `http://localhost:3000`, matching the backend's default port). Update it for testing against a non-local backend.
