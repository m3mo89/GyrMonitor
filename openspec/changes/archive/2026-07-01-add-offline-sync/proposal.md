## Why

Phase 8 is the last MVP capability phase, and every prior phase (`add-authentication`, `add-cattle-management`, `add-observations`, `add-alerts`, `add-dashboard`) explicitly deferred mobile and desktop client implementation to this point — `mobile/` and `desktop/` are still `.NET MAUI` placeholder folders with no generated project. Without native offline-capable clients and a backend store-and-forward sync API, GyrMonitor cannot deliver the MVP promise that field and desktop users keep working during intermittent connectivity. The source of truth for scope and acceptance is `knowledge-base/10-roadmap/phase-8-offline-sync.md`, with supporting detail in `knowledge-base/02-domain/offline-sync.md`, `knowledge-base/04-architecture/offline-first.md`, `knowledge-base/04-architecture/sync-architecture.md`, `knowledge-base/05-api/offline-sync.md`, and `knowledge-base/04-architecture/container-architecture.md`.

## What Changes

- Add the backend `offline-sync` module implementing `POST /api/v1/sync/events`, `POST /api/v1/sync/observations`, and `GET /api/v1/sync/status`, replacing the current `backend/src/offline-sync` placeholder, with `Idempotency-Key` handling, per-item partial-result reporting, and `SyncLog` persistence per `knowledge-base/05-api/offline-sync.md` and `knowledge-base/04-architecture/sync-architecture.md`.
- Generate the `.NET MAUI` mobile project (replacing the `mobile/` placeholder) and implement its field-operator scope: `Authentication` (login/session), `Alerts` (cached alert list/detail), `Observations` (offline-capable capture), SQLite local storage (`PendingObservation`, `LocalAlert`, `SyncQueue`), and a `Sync` feature that drains the queue against the backend endpoints, per `knowledge-base/06-engineering/mobile/*` and `knowledge-base/04-architecture/container-architecture.md`.
- Generate the `.NET MAUI` desktop project (replacing the `desktop/` placeholder) and implement its administrative/simulation scope: `Authentication` (login/session), `Dashboard` summary, `Cattle` view, `Alerts` view, `EventSimulator` (offline-capable event generation, prioritized per `knowledge-base/06-engineering/desktop/overview.md`), SQLite local storage (`PendingEvent`, `SyncQueue`), and a `Sync` feature for `/sync/events`, per `knowledge-base/06-engineering/desktop/*`.
- Apply the shared client architecture conventions (MVVM, feature folders, storage/networking separation isolated from sync logic) documented in `knowledge-base/06-engineering/mobile/maui-architecture.md` and `knowledge-base/06-engineering/desktop/maui-desktop.md` to both clients.
- Add backend and client tests covering idempotent retries, partial sync failure, and offline capture/sync status reflection.

## Capabilities

### New Capabilities

- `offline-sync`: Backend store-and-forward synchronization API (`/sync/events`, `/sync/observations`, `/sync/status`), idempotency enforcement, and `SyncLog` outcome tracking. Requirements sourced from `knowledge-base/10-roadmap/phase-8-offline-sync.md`, `knowledge-base/02-domain/offline-sync.md`, `knowledge-base/04-architecture/sync-architecture.md`, and `knowledge-base/05-api/offline-sync.md`.
- `mobile-client`: `.NET MAUI` field application covering authentication, cached alert review, offline observation capture, local persistence, and synchronization. Requirements sourced from `knowledge-base/06-engineering/mobile/*` and `knowledge-base/04-architecture/container-architecture.md`.
- `desktop-client`: `.NET MAUI` desktop application covering authentication, dashboard/cattle/alerts viewing, event simulation, local persistence, and synchronization. Requirements sourced from `knowledge-base/06-engineering/desktop/*` and `knowledge-base/04-architecture/container-architecture.md`.

### Modified Capabilities

- None. This change consumes the existing `authentication`, `alerts`, `activity-events`, `observations`, `dashboard`, and `cattle-management` backend contracts as-is and does not change their requirements.

## Impact

- Backend: new `offline-sync` module (use cases, controller, DTOs, `SyncLog` persistence/migration), reuse of existing `activity-events` and `observations` write paths, and new tests for idempotency and partial failure.
- Mobile: new `.NET MAUI` project under `mobile/` with `Authentication`, `Alerts`, `Observations`, and `Sync` features plus SQLite storage, replacing all current placeholders in that tree.
- Desktop: new `.NET MAUI` project under `desktop/` with `Authentication`, `Dashboard`, `Cattle`, `Alerts`, `EventSimulator`, and `Sync` features plus SQLite storage, replacing all current placeholders in that tree.
- Database: new `SyncLog` table (or equivalent) in MariaDB via backend migration; SQLite schemas introduced in each client per `knowledge-base/06-engineering/database/sqlite.md`.
- Documentation traceability: proposal intentionally references knowledge-base documents instead of duplicating long requirements, DTO examples, or MAUI folder layouts.
