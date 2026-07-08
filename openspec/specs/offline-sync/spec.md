# Offline Sync Specification

## Purpose

Define the backend synchronization capability that lets mobile and desktop clients upload queued events and observations captured while offline, aligned with `knowledge-base/05-api/offline-sync.md`, `knowledge-base/04-architecture/sync-architecture.md`, and `knowledge-base/02-domain/offline-sync.md`.

## Requirements

### Requirement: Sync events API

The backend SHALL expose protected `POST /api/v1/sync/events` behavior aligned with `knowledge-base/05-api/offline-sync.md` for `FIELD_OPERATOR`, `SYSTEM_GENERATOR`, and `ADMIN`, per `knowledge-base/07-reference/roles-and-permissions.md`.

#### Scenario: Authorized client syncs pending events

- **WHEN** an authenticated `FIELD_OPERATOR`, `SYSTEM_GENERATOR`, or `ADMIN` posts a valid batch of pending events with a required `Idempotency-Key` header
- **THEN** the API returns a successful response with `processed`, `created`, `duplicates`, `failed`, and per-item `results` matching `knowledge-base/05-api/offline-sync.md`

#### Scenario: Missing token cannot sync events

- **WHEN** a request without a valid bearer token is made to `POST /api/v1/sync/events`
- **THEN** the API returns `UNAUTHORIZED`

#### Scenario: Missing idempotency key is rejected

- **WHEN** an authorized caller posts to `POST /api/v1/sync/events` without an `Idempotency-Key` header
- **THEN** the API returns the standardized validation error response

#### Scenario: Unauthorized role cannot sync events

- **WHEN** an authenticated user without sync-events permission posts to `POST /api/v1/sync/events`
- **THEN** the API returns `FORBIDDEN`

### Requirement: Sync observations API

The backend SHALL expose protected `POST /api/v1/sync/observations` behavior aligned with `knowledge-base/05-api/offline-sync.md` for `FIELD_OPERATOR` and `ADMIN`.

#### Scenario: Authorized client syncs pending observations

- **WHEN** an authenticated `FIELD_OPERATOR` or `ADMIN` posts a valid batch of pending observations with a required `Idempotency-Key` header
- **THEN** the API returns a successful response with per-item results and delegates persistence to the existing `observations` capability's idempotent creation behavior

#### Scenario: Unauthorized role cannot sync observations

- **WHEN** an authenticated user without sync-observations permission posts to `POST /api/v1/sync/observations`
- **THEN** the API returns `FORBIDDEN`

### Requirement: Sync status API

The backend SHALL expose protected `GET /api/v1/sync/status` behavior aligned with `knowledge-base/05-api/offline-sync.md` for `FIELD_OPERATOR` and `ADMIN`.

#### Scenario: Authorized client queries sync status

- **WHEN** an authenticated `FIELD_OPERATOR` or `ADMIN` requests `GET /api/v1/sync/status`
- **THEN** the API returns the documented synchronization status summary for that client or device

### Requirement: Sync idempotency enforcement

The backend SHALL apply idempotency to `/sync/events` and `/sync/observations` as required by RF-23 and `knowledge-base/04-architecture/sync-architecture.md`, so repeated requests do not create duplicate records.

#### Scenario: Repeated idempotency key with same payload does not duplicate

- **WHEN** a sync request is retried with the same `Idempotency-Key` and the same payload
- **THEN** the backend returns the previously recorded result without creating additional records

#### Scenario: Repeated idempotency key with different payload is rejected

- **WHEN** a sync request reuses an `Idempotency-Key` already recorded with a different payload
- **THEN** the API returns `IDEMPOTENCY_CONFLICT`

#### Scenario: Duplicate event id within a batch is not duplicated

- **WHEN** a sync events batch contains an `eventId` that already exists in the backend
- **THEN** the corresponding result item reports a duplicate outcome and no new event is created

#### Scenario: Duplicate observation id within a batch is not duplicated

- **WHEN** a sync observations batch contains an `observationId` that already exists in the backend
- **THEN** the corresponding result item reports a duplicate outcome and no new observation is created

### Requirement: Partial sync failure handling

The backend SHALL process sync batches item-by-item and report partial success without failing the entire batch, per `knowledge-base/04-architecture/sync-architecture.md`.

#### Scenario: Invalid item does not block valid items

- **WHEN** a sync batch contains one item referencing an unknown `cattleId` or `alertId` alongside otherwise valid items
- **THEN** the backend persists the valid items, marks the invalid item as failed in the per-item results, and returns an overall successful response

#### Scenario: Failed items are reported for client retry

- **WHEN** a sync batch item fails validation or persistence
- **THEN** the response result for that item includes its `localId` and a failure indicator so the client can keep it queued for retry

### Requirement: Original capture timestamp preservation

The backend SHALL preserve the original client-captured timestamp for synchronized events and observations instead of substituting server receipt time, per SYNC-BR-007 in `knowledge-base/02-domain/offline-sync.md`.

#### Scenario: Synced event keeps original capturedAt

- **WHEN** a pending event is synchronized with a valid `capturedAt` timestamp
- **THEN** the persisted event retains that `capturedAt` value rather than the server's processing time

#### Scenario: Synced observation keeps original createdAt

- **WHEN** a pending observation is synchronized with a valid `createdAt` timestamp
- **THEN** the persisted observation retains that `createdAt` value rather than the server's processing time

### Requirement: Sync outcome persistence

The backend SHALL persist synchronization outcomes (`SyncLog`) so sync status can be queried after processing, per `knowledge-base/02-domain/offline-sync.md`.

#### Scenario: Sync attempt is recorded

- **WHEN** a sync events or sync observations request is processed
- **THEN** the backend records the attempt's outcome, including counts of created, duplicate, and failed items, for later status consultation

#### Scenario: Sync status reflects latest recorded outcome

- **WHEN** a client requests `GET /api/v1/sync/status` after a completed sync attempt
- **THEN** the response reflects the persisted outcome of that attempt

### Requirement: Cross-client sync primitive compatibility

The backend sync contracts SHALL remain compatible with shared client sync primitives used by both desktop and mobile clients.

#### Scenario: Desktop event sync remains contract-compatible

- **WHEN** the desktop client syncs simulator events after shared primitive extraction
- **THEN** `POST /api/v1/sync/events` accepts the request and preserves existing idempotency, duplicate, and partial-failure behavior

#### Scenario: Mobile observation sync remains contract-compatible

- **WHEN** the mobile client syncs observations after shared primitive extraction
- **THEN** `POST /api/v1/sync/observations` accepts the request and preserves existing idempotency, duplicate, and partial-failure behavior

### Requirement: Sync destination traceability

The sync capability SHALL provide enough outcome data for clients and release validation to trace synchronized observations and events to backend records.

#### Scenario: Observation sync result includes server id

- **WHEN** a mobile observation sync item is created or recognized as duplicate
- **THEN** the per-item sync result includes the local id, status, observation id, and server id when available

#### Scenario: Event sync result includes server id

- **WHEN** a desktop event sync item is created or recognized as duplicate
- **THEN** the per-item sync result includes the local id, status, event id, and server id when available

### Requirement: Authenticated user attribution for synced observations

The sync observations API SHALL attribute synchronized observations to the authenticated backend user and SHALL rely on the client only for local ownership filtering, not backend user identity.

#### Scenario: Backend uses authenticated user for synced observation

- **WHEN** mobile syncs a pending observation with a valid token
- **THEN** the persisted backend observation uses the authenticated token subject as `userId`

#### Scenario: Client owner id cannot impersonate backend user

- **WHEN** a sync observations request includes client-side local ownership metadata
- **THEN** the backend does not use that metadata to assign the persisted observation `userId`
