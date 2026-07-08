## ADDED Requirements

### Requirement: Mobile project foundation

The mobile client SHALL be a generated `.NET MAUI` project under `mobile/` following the feature-based `MVVM` structure documented in `knowledge-base/06-engineering/mobile/maui-architecture.md`, replacing the current placeholder scaffolding.

#### Scenario: Mobile project builds

- **WHEN** the mobile `.NET MAUI` project is built with the documented setup path
- **THEN** the build succeeds and produces the `Authentication`, `Alerts`, `Observations`, and `Sync` feature areas under `Features/`, with storage and networking isolated under `Shared/`

### Requirement: Mobile authentication

The mobile client SHALL authenticate field operators against the existing backend `POST /api/v1/auth/login` endpoint and persist the resulting session for authenticated API calls, per `knowledge-base/06-engineering/mobile/overview.md`.

#### Scenario: Field operator logs in

- **WHEN** a user submits valid credentials on the mobile login screen
- **THEN** the app stores the access token and authenticated user summary and navigates to the alerts workflow

#### Scenario: Invalid credentials are shown to the user

- **WHEN** a user submits invalid credentials on the mobile login screen
- **THEN** the app displays the login error without navigating away from the login screen

#### Scenario: Expired or missing session requires re-login

- **WHEN** the mobile app makes an authenticated request without a valid stored session
- **THEN** the app redirects the user to the login screen instead of showing stale data as authenticated

### Requirement: Mobile alert review

The mobile client SHALL display cached alerts for field review without calculating authoritative risk or severity, per `knowledge-base/06-engineering/mobile/overview.md` and `knowledge-base/04-architecture/container-architecture.md`.

#### Scenario: Field operator views alert list

- **WHEN** an authenticated field operator opens the alerts screen with connectivity available
- **THEN** the app fetches alerts from the backend, displays them, and caches them as `LocalAlert` records for offline use

#### Scenario: Field operator views cached alerts offline

- **WHEN** an authenticated field operator opens the alerts screen without connectivity
- **THEN** the app displays the most recently cached `LocalAlert` records and indicates the data may be stale

#### Scenario: Field operator views alert detail

- **WHEN** an authenticated field operator selects an alert
- **THEN** the app displays the alert detail using backend-provided or cached values only

### Requirement: Mobile offline observation capture

The mobile client SHALL allow field operators to capture observations locally regardless of connectivity, per `knowledge-base/02-domain/offline-sync.md` and `knowledge-base/06-engineering/mobile/offline-storage.md`.

#### Scenario: Observation is saved locally before sync

- **WHEN** a field operator submits an observation for an alert
- **THEN** the app persists a `PendingObservation` record in SQLite with a stable local id and enqueues a `SyncQueue` item before any network call is attempted

#### Scenario: Offline observation capture succeeds without connectivity

- **WHEN** a field operator submits an observation while offline
- **THEN** the app confirms the observation was saved locally and marks it as pending synchronization

### Requirement: Mobile local persistence

The mobile client SHALL use SQLite to persist `LocalAlert`, `PendingObservation`, and `SyncQueue` records with retry metadata, per `knowledge-base/06-engineering/mobile/offline-storage.md` and `knowledge-base/04-architecture/offline-first.md`.

#### Scenario: Queued item has a stable local identifier

- **WHEN** an offline operation is queued
- **THEN** the `SyncQueue` record includes a stable local id, entity type, operation, retry count, status, and creation timestamp

#### Scenario: Local storage survives app restart

- **WHEN** the mobile app is restarted while pending observations exist
- **THEN** the pending observations and their queue status remain available

### Requirement: Mobile synchronization

The mobile client SHALL synchronize queued observations against `POST /api/v1/sync/observations` using the `offline-sync` capability, per `knowledge-base/06-engineering/mobile/sync-client.md`.

#### Scenario: Sync runs when connectivity returns

- **WHEN** connectivity becomes available while pending `SyncQueue` items exist
- **THEN** the app sends the pending items to `POST /api/v1/sync/observations` with a stable `Idempotency-Key` per item or batch

#### Scenario: Synced item is marked synced

- **WHEN** the backend confirms successful synchronization of a queued item
- **THEN** the app updates the local `SyncQueue` status to `SYNCED` and links the item to its backend id

#### Scenario: Failed sync item is retried

- **WHEN** a queued item fails to synchronize
- **THEN** the app increments its retry count, sets its status to `FAILED`, and keeps it available for a later retry instead of discarding it

#### Scenario: Retried sync does not duplicate records

- **WHEN** the app retries a previously attempted sync item using the same local id and `Idempotency-Key`
- **THEN** the backend does not create a duplicate server record

### Requirement: Mobile connectivity and sync status UX

The mobile client SHALL clearly indicate offline state, pending saves, sync in progress, sync failure, and stale data, per the User Experience Requirements in `knowledge-base/04-architecture/offline-first.md`.

#### Scenario: App indicates offline state

- **WHEN** the device has no connectivity
- **THEN** the app displays an indicator that the user is offline

#### Scenario: App indicates pending sync count

- **WHEN** pending `SyncQueue` items exist
- **THEN** the app displays how many items are waiting to be synchronized

#### Scenario: App indicates sync failure

- **WHEN** a queued item's status is `FAILED`
- **THEN** the app surfaces the failure to the user instead of silently discarding it
