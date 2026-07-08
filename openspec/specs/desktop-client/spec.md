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

The desktop client SHALL clearly indicate offline state, pending saves, sync in progress, sync failure, and stale data, per the User Experience Requirements in `knowledge-base/04-architecture/offline-first.md`. The offline indicator SHALL be visible from any tab and SHALL update live as connectivity changes, and the outcome of a synchronization run (automatic or manual) SHALL be surfaced to the user without requiring them to already be on the Sync tab.

#### Scenario: App indicates offline state on any tab, live

- **WHEN** the desktop app's network access transitions from available to unavailable while an administrator is on any tab
- **THEN** the app displays an offline indicator without requiring the administrator to navigate away from and back to the current tab

#### Scenario: Offline indicator clears on connectivity restoration

- **WHEN** the desktop app's network access transitions from unavailable to available while the offline indicator is shown
- **THEN** the app hides the offline indicator without requiring navigation

#### Scenario: Screens remain usable while offline

- **WHEN** the offline indicator is shown
- **THEN** the administrator can still open the Dashboard, Cattle, Alerts, Simulator, and Sync tabs, and can still generate simulated events

#### Scenario: App indicates pending sync count

- **WHEN** pending `SyncQueue` items exist
- **THEN** the app displays how many items are waiting to be synchronized

#### Scenario: App indicates sync failure

- **WHEN** a queued item's status is `FAILED`
- **THEN** the app surfaces the failure to the user instead of silently discarding it

#### Scenario: Automatic reconnect sync shows a confirmation

- **WHEN** connectivity is restored and the desktop client automatically synchronizes pending events
- **THEN** the app displays a confirmation summarizing how many events were synchronized, without the administrator needing to open the Sync tab

#### Scenario: Manual sync shows a confirmation

- **WHEN** an administrator taps "Sync now" on the Sync tab and the synchronization run completes
- **THEN** the app displays a confirmation summarizing the outcome, including any failures

### Requirement: Desktop dashboard visual presentation

The desktop dashboard screen SHALL present its summary metrics (total cattle, active alerts, high-risk cattle, average risk score, events today, pending sync) as visually distinct metric cards using the shared desktop UI design system, rather than bare labels in a grid.

#### Scenario: Dashboard metrics render as cards

- **WHEN** an authenticated administrator opens the desktop dashboard screen with metrics loaded
- **THEN** each metric is displayed inside a styled card with a label and value, using the shared card style

#### Scenario: Empty risk ranking shows empty state

- **WHEN** an authenticated administrator opens the desktop dashboard screen and the risk ranking list is empty
- **THEN** the screen displays the shared empty-state view in place of the risk ranking list

### Requirement: Desktop list screen visual presentation

The desktop cattle and alerts screens SHALL present each record as a styled card-style row with clear visual hierarchy (primary identifier, secondary detail, status/severity badge) using the shared desktop UI design system, and SHALL display the shared empty-state view when their bound collection is empty after loading.

#### Scenario: Alert row shows severity as a badge

- **WHEN** an authenticated administrator opens the desktop alerts screen with alerts loaded
- **THEN** each alert's severity is displayed using the shared severity badge style instead of a plain colored label

#### Scenario: Empty cattle list shows empty state

- **WHEN** an authenticated administrator opens the desktop cattle screen and no cattle records are returned
- **THEN** the screen displays the shared empty-state view instead of a blank list area

### Requirement: Desktop login visual presentation

The desktop login screen SHALL present the sign-in form as a centered, branded card using the shared desktop UI design system, with the shared error-brush styling for login error messages.

#### Scenario: Login form renders as a branded card

- **WHEN** an unauthenticated user opens the desktop app
- **THEN** the sign-in form is displayed inside a centered card with consistent spacing from the shared design system

### Requirement: Desktop sync screen visual presentation

The desktop sync screen SHALL present pending sync items using the shared desktop UI design system, including status badges for queue item state, and SHALL display the shared empty-state view when there are no pending sync items.

#### Scenario: Empty sync queue shows empty state

- **WHEN** an authenticated administrator opens the desktop sync screen and there are no pending sync items
- **THEN** the screen displays the shared empty-state view instead of a blank list area
