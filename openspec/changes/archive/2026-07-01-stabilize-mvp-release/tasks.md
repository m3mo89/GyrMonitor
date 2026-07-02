## 1. Shared Client Core

- [x] 1.1 Create a MAUI-neutral shared client core project and add it to the desktop and mobile solutions/projects.
- [x] 1.2 Move shared networking primitives (`ApiOptions`, `ApiEnvelope`, `ApiRequestSender`) into the shared core and update desktop/mobile namespaces.
- [x] 1.3 Move shared session contracts/models/events into the shared core and update desktop/mobile secure storage implementations to reference them.
- [x] 1.4 Move shared SQLite connection contract and sync primitive types into the shared core while keeping entity-specific repositories in desktop/mobile.
- [x] 1.5 Add a shared idempotency-key helper and update desktop/mobile sync services to use it.
- [x] 1.6 Run desktop and mobile core tests after each extraction group and fix namespace or reference regressions.

## 2. Desktop Simulator Usability

- [x] 2.1 Extend the desktop event simulator view model to load cattle options using the existing cattle API/client path.
- [x] 2.2 Replace the primary raw cattle UUID entry in the simulator UI with cattle selection using readable cattle display values.
- [x] 2.3 Ensure generated `PendingEvent` records preserve the selected backend `cattleId`.
- [x] 2.4 Add validation and tests for missing cattle selection, empty cattle list, and selected-cattle event generation.

## 3. Mobile Observation Traceability

- [x] 3.1 Verify mobile observation capture stores `PendingObservation` and `SyncQueue` records in the mobile SQLite database before sync.
- [x] 3.2 Update mobile sync tests to assert `observationId`, `alertId`, `comment`, `createdAt`, and `clientId` are preserved in `POST /api/v1/sync/observations` payloads.
- [x] 3.3 Ensure successful observation sync marks both local pending observation and queue item as `SYNCED` with the returned server id.
- [x] 3.4 Ensure failed observation sync keeps the observation retryable and exposes failure state through sync status UX.
- [x] 3.5 Add mobile role gating after login so only `FIELD_OPERATOR` and supported `ADMIN` access can enter alerts, observation capture, and sync workflows.
- [x] 3.6 Add authenticated user ownership to mobile local `PendingObservation` and `SyncQueueItem` records.
- [x] 3.7 Filter mobile pending/all observation and sync queue queries by the active authenticated user.
- [x] 3.8 Ensure connectivity-restored auto sync skips when no valid supported session exists and syncs only the active user's queue.
- [x] 3.9 Add tests proving a second logged-in mobile user cannot see or sync the previous user's pending observations.

## 4. Backend Sync and Observation Evidence

- [x] 4.1 Add or update backend e2e coverage proving synced mobile observations are returned by alert-scoped observation consultation.
- [x] 4.2 Add or update backend e2e coverage proving duplicate mobile observation retries do not create duplicate observation rows.
- [x] 4.3 Add or update backend e2e coverage proving desktop simulator event sync remains idempotent and returns server ids.
- [x] 4.4 Verify sync status/log output is sufficient to identify created, duplicate, and failed item outcomes.

## 5. Release Validation

- [x] 5.1 Add a release smoke checklist or script covering backend startup, login, desktop event generation, event sync, alert visibility, mobile observation capture, observation sync, and backend consultation.
- [x] 5.2 Document where local mobile observations are stored and how they move from SQLite to backend observations.
- [x] 5.3 Document why desktop/mobile share low-level core primitives while keeping feature workflows separate.
- [x] 5.4 Document mobile role restrictions and local user-scoped offline data behavior.
- [x] 5.5 Run backend tests, desktop core tests, mobile core tests, and the release smoke flow; record any remaining release blockers.
