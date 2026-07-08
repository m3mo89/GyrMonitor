## ADDED Requirements

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
