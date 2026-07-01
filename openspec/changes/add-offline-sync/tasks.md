## 1. Backend Sync Idempotency Foundation

- [x] 1.1 Add a `SyncLog`/idempotency-key MariaDB migration (key, endpoint, payload hash, recorded outcome, timestamps) per `knowledge-base/06-engineering/database/migrations.md`.
- [x] 1.2 Replace the `backend/src/offline-sync` placeholder with a module boundary (`offline-sync`) containing controller, use cases, and DTOs.
- [x] 1.3 Implement idempotency-key lookup/record service: same key + same payload returns prior result, same key + different payload returns `IDEMPOTENCY_CONFLICT`.

## 2. Backend Sync Events and Observations

- [x] 2.1 Define sync request/response DTOs matching `knowledge-base/05-api/offline-sync.md` (batch items, `processed`/`created`/`duplicates`/`failed`/`results`).
- [x] 2.2 Implement `SyncEventsUseCase` delegating each batch item to the existing `activity-events` creation use case, preserving `capturedAt` and `source`.
- [x] 2.3 Implement `SyncObservationsUseCase` delegating each batch item to the existing `observations` creation use case, preserving `createdAt`.
- [x] 2.4 Implement protected `POST /api/v1/sync/events` for `FIELD_OPERATOR`, `SYSTEM_GENERATOR`, `ADMIN` requiring `Idempotency-Key`.
- [x] 2.5 Implement protected `POST /api/v1/sync/observations` for `FIELD_OPERATOR`, `ADMIN` requiring `Idempotency-Key`.
- [x] 2.6 Handle per-item failures (unknown `cattleId`/`alertId`) without failing the whole batch; report failed items with their `localId`.

## 3. Backend Sync Status

- [x] 3.1 Implement `GetSyncStatusUseCase` reading persisted `SyncLog` outcomes for a client/device.
- [x] 3.2 Implement protected `GET /api/v1/sync/status` for `FIELD_OPERATOR`, `ADMIN`.
- [x] 3.3 Add backend unit tests for idempotent retry (same key/payload), idempotency conflict (same key/different payload), duplicate `eventId`/`observationId`, partial batch failure, and timestamp preservation.
- [x] 3.4 Add backend HTTP/e2e tests for `POST /sync/events`, `POST /sync/observations`, `GET /sync/status` covering success, `UNAUTHORIZED`, `FORBIDDEN`, and missing-idempotency-key validation.

## 4. Mobile Project Foundation

- [x] 4.1 Generate the `.NET MAUI` mobile project under `mobile/` (`dotnet new maui`) replacing the placeholder, with `Features/{Authentication,Alerts,Observations,Sync}` and `Shared/{Networking,Storage,Navigation}` per `knowledge-base/06-engineering/mobile/maui-architecture.md`.
- [x] 4.2 Add the SQLite storage dependency and a typed HTTP client wrapper for the backend API base URL/auth header handling.
- [x] 4.3 Update `mobile/README.md` to reflect the generated project, chosen packages, and build/run instructions.

## 5. Mobile Authentication

- [x] 5.1 Implement the mobile login screen/view-model calling `POST /api/v1/auth/login`.
- [x] 5.2 Persist the access token and authenticated user summary using MAUI `SecureStorage`.
- [x] 5.3 Add a session guard that redirects to login when no valid session exists or a protected call returns `UNAUTHORIZED`.

## 6. Mobile Alerts

- [x] 6.1 Implement the alerts list screen fetching from the backend alerts API and rendering with existing `severity`/`status` fields only.
- [x] 6.2 Cache fetched alerts as `LocalAlert` SQLite records and render cached alerts with a stale indicator when offline.
- [x] 6.3 Implement the alert detail screen using backend-provided or cached values only.

## 7. Mobile Observations and Local Storage

- [x] 7.1 Define the SQLite schema for `LocalAlert`, `PendingObservation`, and `SyncQueue` per `knowledge-base/06-engineering/database/sqlite.md`.
- [x] 7.2 Implement the observation capture screen that writes a `PendingObservation` and enqueues a `SyncQueue` item before any network call, with a stable local id.
- [x] 7.3 Confirm capture succeeds and is marked pending when offline.

## 8. Mobile Sync

- [x] 8.1 Implement the mobile sync client service that reads pending `SyncQueue` items and posts them to `POST /api/v1/sync/observations` with a stable `Idempotency-Key`.
- [x] 8.2 Trigger sync on connectivity-restored events and via an explicit manual sync action.
- [x] 8.3 Update queue item status to `SYNCED` (with backend id) or `FAILED` (with incremented retry count) based on the sync result.
- [x] 8.4 Surface offline state, pending sync count, and sync failures in the mobile UI per `knowledge-base/04-architecture/offline-first.md`.

## 9. Desktop Project Foundation

- [x] 9.1 Generate the `.NET MAUI` desktop project under `desktop/` (`dotnet new maui`) replacing the placeholder, with `Features/{Authentication,Dashboard,Cattle,Alerts,EventSimulator,Sync}` and `Shared/{Networking,Storage,Navigation}` per `knowledge-base/06-engineering/desktop/maui-desktop.md`.
- [x] 9.2 Add the SQLite storage dependency and a typed HTTP client wrapper matching the mobile client's approach.
- [x] 9.3 Update `desktop/README.md` to reflect the generated project, chosen packages, and build/run instructions.

## 10. Desktop Authentication

- [x] 10.1 Implement the desktop login screen/view-model calling `POST /api/v1/auth/login`.
- [x] 10.2 Persist the access token and authenticated user summary using MAUI `SecureStorage`.
- [x] 10.3 Add a session guard that redirects to login when no valid session exists or a protected call returns `UNAUTHORIZED`.

## 11. Desktop Dashboard, Cattle, and Alerts Viewing

- [x] 11.1 Implement the desktop dashboard screen consuming `GET /api/v1/dashboard` without local recalculation.
- [x] 11.2 Implement the desktop cattle list screen consuming the existing cattle-management API.
- [x] 11.3 Implement the desktop alerts list screen consuming the existing alerts API.

## 12. Desktop Event Simulator and Local Storage

- [x] 12.1 Define the SQLite schema for `PendingEvent` and `SyncQueue` per `knowledge-base/06-engineering/database/sqlite.md`.
- [x] 12.2 Implement the event simulator screen that generates activity/inactivity events tagged with a desktop-simulator source, isolated from production ingestion logic.
- [x] 12.3 Persist generated events as `PendingEvent` and enqueue a `SyncQueue` item before any network call, with a stable local id.
- [x] 12.4 Confirm event capture succeeds and is marked pending when offline.

## 13. Desktop Sync

- [x] 13.1 Implement the desktop sync client service that reads pending `SyncQueue` items and posts them to `POST /api/v1/sync/events` with a stable `Idempotency-Key`.
- [x] 13.2 Trigger sync on connectivity-restored events and via an explicit manual sync action.
- [x] 13.3 Update queue item status to `SYNCED` (with backend id) or `FAILED` (with incremented retry count) based on the sync result.
- [x] 13.4 Surface offline state, pending sync count, and sync failures in the desktop UI per `knowledge-base/04-architecture/offline-first.md`.

## 14. Cross-Client Tests and Validation

- [x] 14.1 Add mobile tests for login, alert caching/offline display, observation capture, queue status transitions, and idempotent retry (no duplicate creation on retry).
- [x] 14.2 Add desktop tests for login, dashboard/cattle/alerts viewing, event simulation capture, queue status transitions, and idempotent retry (no duplicate creation on retry).
- [x] 14.3 Validated end-to-end against a live local backend + MariaDB (not just mocked e2e tests): logged in as SYSTEM_GENERATOR/FIELD_OPERATOR/ADMIN, posted a desktop-simulated event via `POST /sync/events` and a mobile observation via `POST /sync/observations`, retried each with the same `Idempotency-Key`/payload (server replayed the cached result, DB row count stayed at 1), confirmed a changed payload on a reused key returns `409 IDEMPOTENCY_CONFLICT`, confirmed a mixed valid/invalid batch returns partial success, confirmed original `capturedAt`/`createdAt` are preserved, and confirmed `GET /sync/status` reflects both clients. Driving the actual MAUI UI headlessly was not feasible in this environment; the mobile/desktop `SyncQueue` "no duplicate on retry" behavior is covered by `MobileSyncServiceTests`/`DesktopSyncServiceTests` against the same backend contract.
- [x] 14.4 Ran backend build/test commands (`npm run build`, `npm run test`, `npm run lint`: 76/76 passing) and mobile/desktop build/test commands (`dotnet test` Core: 27/27 and 18/18 passing; `dotnet build` MAUI head projects for `net10.0-maccatalyst`: succeeded) documented in each project. Also ran the frontend suite (`npm run test`, `npm run build`) as a regression check since this change did not touch frontend code: 8/8 passing.
- [x] 14.5 Verify OpenSpec status for `add-offline-sync` before implementation handoff.
