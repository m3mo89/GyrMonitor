# Desktop Client Specification

## Purpose

Define the desktop `.NET MAUI` client used by administrators to authenticate, review the dashboard, cattle, and alerts, simulate events, and sync with the backend `offline-sync` capability, aligned with `knowledge-base/06-engineering/desktop/overview.md`.

## Requirements

### Requirement: Desktop project foundation
The desktop client SHALL be a generated `.NET MAUI` project under `desktop/` following the feature-based `MVVM` structure documented in `knowledge-base/06-engineering/desktop/maui-desktop.md`, replacing the current placeholder scaffolding. The desktop project SHALL target only desktop platforms (`net10.0-maccatalyst` and `net10.0-windows10.0.19041.0`) and SHALL NOT declare `net10.0-android` or `net10.0-ios` as target frameworks.

#### Scenario: Desktop project builds
- **WHEN** the desktop `.NET MAUI` project is built with the documented setup path
- **THEN** the build succeeds and produces the `Authentication`, `Dashboard`, `Cattle`, `Alerts`, `EventSimulator`, and `Sync` feature areas under `Features/`, with storage and networking isolated under `Shared/`

#### Scenario: Desktop project has no mobile target frameworks
- **WHEN** the desktop `.NET MAUI` project's `TargetFrameworks` are inspected
- **THEN** the list does not include `net10.0-android` or `net10.0-ios`

#### Scenario: Building desktop for a mobile target fails
- **WHEN** a build is attempted against the desktop project with `-f net10.0-android` or `-f net10.0-ios`
- **THEN** the build fails because the desktop project does not declare that target framework

### Requirement: Desktop authentication
The desktop client SHALL authenticate administrative users against the existing backend `POST /api/v1/auth/login` endpoint and persist the resulting session for authenticated API calls, per `knowledge-base/06-engineering/desktop/overview.md`.

#### Scenario: Administrator logs in
- **WHEN** a user submits valid credentials on the desktop login screen
- **THEN** the app stores the access token and authenticated user summary and navigates to the desktop workspace

#### Scenario: Invalid credentials are shown to the user
- **WHEN** a user submits invalid credentials on the desktop login screen
- **THEN** the app displays the login error without navigating away from the login screen

### Requirement: Desktop dashboard summary
The desktop client SHALL display a dashboard-style summary sourced from the existing backend dashboard aggregate, without recalculating metrics locally, per `knowledge-base/06-engineering/desktop/overview.md` and `knowledge-base/04-architecture/container-architecture.md`.

#### Scenario: Administrator views dashboard summary
- **WHEN** an authenticated administrator opens the desktop dashboard screen with connectivity available
- **THEN** the app displays the backend `GET /api/v1/dashboard` values without local recalculation

### Requirement: Desktop cattle and alerts viewing
The desktop client SHALL display cattle records and alerts sourced from existing backend endpoints for administrative review, per `knowledge-base/06-engineering/desktop/overview.md`.

#### Scenario: Administrator views cattle list
- **WHEN** an authenticated administrator opens the desktop cattle screen
- **THEN** the app displays cattle records from the backend cattle-management capability

#### Scenario: Administrator views alert list
- **WHEN** an authenticated administrator opens the desktop alerts screen
- **THEN** the app displays alerts from the backend alerts capability

### Requirement: Desktop event simulation
The desktop client SHALL provide an event simulator that generates activity and inactivity events clearly identified as simulator-sourced, isolated from production event ingestion logic, per `knowledge-base/06-engineering/desktop/event-simulator.md` and the MVP priority documented in `knowledge-base/06-engineering/desktop/overview.md`.

#### Scenario: Simulated event is source-tagged
- **WHEN** an administrator generates a simulated activity or inactivity event
- **THEN** the event is recorded with a source identifying it as desktop-simulator-generated

#### Scenario: Simulated event is saved locally before sync
- **WHEN** an administrator generates a simulated event
- **THEN** the app persists a `PendingEvent` record in SQLite with a stable local id and enqueues a `SyncQueue` item before any network call is attempted

#### Scenario: Offline event simulation succeeds without connectivity
- **WHEN** an administrator generates a simulated event while offline
- **THEN** the app confirms the event was saved locally and marks it as pending synchronization

### Requirement: Desktop simulator cattle selection
The desktop event simulator SHALL allow administrators to select an existing cattle record without manually typing a cattle UUID.

#### Scenario: Simulator loads cattle options
- **WHEN** an authenticated administrator opens the desktop event simulator with connectivity available
- **THEN** the simulator loads cattle records from the existing cattle API and presents selectable cattle options with human-readable identifiers

#### Scenario: Selected cattle id is used for generated event
- **WHEN** an administrator selects a cattle record and generates a simulated event
- **THEN** the generated `PendingEvent` stores the selected record's backend `cattleId`

#### Scenario: Missing selection blocks generation
- **WHEN** an administrator attempts to generate a simulated event without a selected cattle record
- **THEN** the app displays a validation error and does not create a pending event or sync queue item

### Requirement: Desktop simulator release usability
The desktop simulator SHALL keep UUID entry out of the primary release workflow while preserving traceability to the backend cattle id.

#### Scenario: Simulator does not require memorized UUIDs
- **WHEN** an administrator performs the release smoke flow for event simulation
- **THEN** the administrator can complete the flow using visible cattle information instead of copying a UUID from backend data or seed files

### Requirement: Desktop local persistence
The desktop client SHALL use SQLite to persist `PendingEvent` and `SyncQueue` records with retry metadata, per `knowledge-base/04-architecture/offline-first.md` and `knowledge-base/06-engineering/database/sqlite.md`.

#### Scenario: Queued item has a stable local identifier
- **WHEN** an offline event is queued
- **THEN** the `SyncQueue` record includes a stable local id, entity type, operation, retry count, status, and creation timestamp

#### Scenario: Local storage survives app restart
- **WHEN** the desktop app is restarted while pending events exist
- **THEN** the pending events and their queue status remain available

### Requirement: Desktop synchronization
The desktop client SHALL synchronize queued events against `POST /api/v1/sync/events` using the `offline-sync` capability, per `knowledge-base/04-architecture/sync-architecture.md`, using the same sync concepts as the mobile client per `knowledge-base/06-engineering/desktop/maui-desktop.md`.

#### Scenario: Sync runs when connectivity returns
- **WHEN** connectivity becomes available while pending `SyncQueue` items exist
- **THEN** the app sends the pending items to `POST /api/v1/sync/events` with a stable `Idempotency-Key`

#### Scenario: Synced item is marked synced
- **WHEN** the backend confirms successful synchronization of a queued item
- **THEN** the app updates the local `SyncQueue` status to `SYNCED` and links the item to its backend id

#### Scenario: Failed sync item is retried
- **WHEN** a queued item fails to synchronize
- **THEN** the app increments its retry count, sets its status to `FAILED`, and keeps it available for a later retry instead of discarding it

#### Scenario: Retried sync does not duplicate records
- **WHEN** the app retries a previously attempted sync item using the same local id and `Idempotency-Key`
- **THEN** the backend does not create a duplicate server record

### Requirement: Desktop connectivity and sync status UX
The desktop client SHALL clearly indicate offline state, pending saves, sync in progress, sync failure, and stale data, per the User Experience Requirements in `knowledge-base/04-architecture/offline-first.md`.

#### Scenario: App indicates offline state
- **WHEN** the desktop app has no connectivity
- **THEN** the app displays an indicator that the user is offline

#### Scenario: App indicates pending sync count
- **WHEN** pending `SyncQueue` items exist
- **THEN** the app displays how many items are waiting to be synchronized

#### Scenario: App indicates sync failure
- **WHEN** a queued item's status is `FAILED`
- **THEN** the app surfaces the failure to the user instead of silently discarding it
