## Context

Desktop and mobile are both `.NET MAUI` apps, but the current repo uses separate pure `.NET` core projects: `desktop/GyrMonitor.Desktop.Core` and `mobile/GyrMonitor.Mobile.Core`. Those projects target `net10.0`, use the same core dependencies, and duplicate shared primitives such as `ApiOptions`, `ApiEnvelope`, `ApiRequestSender`, connectivity interfaces, auth session models, SQLite connection contracts, sync statuses, sync queue records, and repository patterns.

The feature workflows are intentionally different. Desktop owns dashboard, cattle review, alerts review, and event simulation/sync. Mobile owns alert review, observation capture, local alert cache, and observation sync. Observations captured on mobile are currently saved to SQLite as `PendingObservation`, queued as `SyncQueueItem`, then posted to `POST /api/v1/sync/observations`. Desktop simulated events are saved as `PendingEvent`, queued, then posted to `POST /api/v1/sync/events`.

The desktop simulator currently requires the user to type a `cattleId` UUID manually. That happens because `EventSimulatorViewModel` only exposes a string `CattleId` entry, while the desktop app already has a cattle API/client/view model elsewhere.

Mobile authentication stores `UserId` and `Role`, but local offline records currently do not include an owner. `PendingObservation`, `SyncQueueItem`, and `LocalAlert` are shared within the same local SQLite database, so a second authenticated user on the same device could see or sync pending data created by the previous user unless records are explicitly scoped by user.

## Goals / Non-Goals

**Goals:**

- Extract MAUI-neutral shared client primitives into a shared core project referenced by both desktop and mobile core projects.
- Preserve separate desktop and mobile feature implementations where workflow and entity shape differ.
- Make the mobile observation destination explicit and testable from local SQLite capture through backend observation persistence.
- Enforce supported mobile roles after login and prevent unsupported roles from entering alert/observation workflows.
- Scope mobile local offline data and sync processing to the authenticated user.
- Replace manual UUID entry in the desktop simulator with cattle selection backed by existing cattle data.
- Add release smoke validation that proves the MVP flow works across backend, desktop, and mobile.

**Non-Goals:**

- Merge desktop and mobile into a single MAUI app.
- Share XAML pages, Shell routes, platform-specific services, or app startup code.
- Replace the existing backend sync endpoints or change their public contracts.
- Build a full automatic background sync scheduler beyond the existing manual/connectivity-triggerable sync behavior.
- Add non-MVP observation attachments, veterinary forms, or media capture.

## Decisions

### Share primitives, not feature workflows

Create a shared project such as `clients/GyrMonitor.Client.Core` or `shared/GyrMonitor.Client.Core` for MAUI-neutral code. Move common contracts and helpers there first: networking envelope/request sender/options, auth session data/events/interfaces, SQLite connection provider interface, sync statuses/operations/entity types, sync queue item shape, and idempotency key helper.

Alternative considered: keep duplication until after MVP. That avoids immediate refactor cost but leaves two implementations of the same auth/networking/sync primitives, which increases stabilization risk. Alternative considered: merge desktop and mobile feature code into one app core. That over-shares workflows that are different by product role and would make the release harder to reason about.

### Keep entity-specific sync services separate

Desktop `DesktopSyncService` and mobile `MobileSyncService` should share low-level sync primitives but remain separate services. Their payloads are different: desktop syncs activity events with `deviceId`, `eventId`, `cattleId`, event type, captured time, and simulator source; mobile syncs observations with `observationId`, `alertId`, comment, created time, and client id.

Alternative considered: generic sync service for all entities. That reduces duplication but would likely introduce abstraction before the MVP has enough synced entity types to justify it.

### Make observation storage and backend destination visible

Mobile observation capture should continue to be offline-first. The local destination is the mobile SQLite database under `FileSystem.AppDataDirectory` as `gyrmonitor-mobile.db3`, with `PendingObservation` and `SyncQueue` tables. The backend destination is `POST /api/v1/sync/observations`; the backend delegates to the observations capability and ultimately persists observations through the observation repository.

The UI and tests should make this traceable: after saving, the app shows a pending/saved state; after sync, the queue item and pending observation are marked `SYNCED` with `ServerId`; backend tests verify persisted observation consultation by alert.

### Enforce mobile role and user-local data scope

After mobile login, allow only roles that can operate the mobile workflow. The MVP should allow `FIELD_OPERATOR`; `ADMIN` can remain allowed if needed for support/testing because backend sync and observation creation already permit it. Other roles, including `RESEARCHER` and `SYSTEM_GENERATOR`, must not navigate into alerts, observation capture, or sync pages on mobile.

Mobile local records that represent user-owned work must carry the authenticated `UserId`. At minimum this includes `PendingObservation` and `SyncQueueItem`; `LocalAlert` should also be user-scoped if cached alert visibility can differ by role or future assignment rules. Repository methods that return pending/all records should filter by current user, and `MobileSyncService` should synchronize only queue items belonging to the active authenticated user. Automatic sync on connectivity restore must resolve the active user before syncing or skip sync when no valid supported session exists.

Alternative considered: clear all local data on logout or new login. That avoids cross-user exposure but can destroy unsynced work if the previous field operator signs out before connectivity returns. User-scoped local records preserve pending work without letting another user view or submit it.

### Use cattle selection for simulator input

The desktop simulator should load cattle options via the existing desktop cattle API and expose a selectable list showing human-readable cattle data while binding the selected item id into generated events. The generated `PendingEvent.CattleId` remains the backend UUID; the user no longer has to know or type it.

Alternative considered: seed a fixed default cattle id into the simulator. That helps demos but does not solve real operator/admin usability and breaks as soon as seed data changes.

### Stabilize with smoke tests across boundaries

Add focused release smoke checks instead of exhaustive UI automation. Backend e2e tests should prove sync events and observations land in persisted repositories idempotently. Client core tests should prove local save, queue creation, sync success/failure, and idempotency-key stability. Manual release checklist or scripted smoke steps should cover MAUI app operation where automated device UI tests are too heavy for the MVP.

## Risks / Trade-offs

- Shared project extraction can create namespace churn -> migrate in small slices and keep public behavior covered by existing desktop/mobile core tests.
- SQLite model sharing can accidentally force desktop and mobile tables to be identical -> share only truly common queue/status primitives; keep `PendingEvent`, `PendingObservation`, and `LocalAlert` entity-specific.
- Manual UUID removal depends on cattle data availability -> show empty/error states in simulator and keep validation that no event can be generated without a selected cattle record.
- Sync observability may still be split between local SQLite and backend `sync_log` -> include release validation steps that inspect both client-side statuses and backend observation/event APIs.
- User-scoped local records require lightweight migration from existing unscoped SQLite rows -> treat legacy rows as inaccessible until assigned through an explicit migration or cleared during stabilization.
- MAUI UI automation may be costly on CI -> rely on core tests plus documented smoke run for MVP, then expand automation after release stabilization.

## Migration Plan

1. Add the shared client core project and wire desktop/mobile core references without moving feature-specific code.
2. Move common primitives one group at a time, updating namespaces and tests after each group.
3. Update desktop simulator to load/select cattle and remove the raw UUID entry as the primary path.
4. Add mobile role gating after login and route/session checks for alerts, observation capture, and sync pages.
5. Add mobile user ownership fields and repository filters for local observations, sync queue items, and alert cache as needed.
6. Add or update tests for observation local save, user-scoped observation sync, event simulator selection, and sync idempotency.
7. Run backend e2e tests and both client core test suites.
8. If extraction causes release risk, rollback by keeping duplicated primitives and still land role gating, user-scoped sync, simulator selection, and release validation work.

## Open Questions

- Preferred location/name for the shared core project: `shared/GyrMonitor.Client.Core` or `clients/GyrMonitor.Client.Core`.
- Whether the release smoke run should become a script in this change or remain a documented checklist until MAUI device automation is added.
