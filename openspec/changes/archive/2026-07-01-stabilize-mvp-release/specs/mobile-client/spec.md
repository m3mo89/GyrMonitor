## ADDED Requirements

### Requirement: Mobile role-gated access

The mobile client SHALL allow only supported mobile roles to access alert review, observation capture, and mobile sync workflows after login.

#### Scenario: Field operator enters mobile workflow

- **WHEN** a user with role `FIELD_OPERATOR` logs in successfully on mobile
- **THEN** the app navigates to the alerts workflow and allows observation capture and sync actions

#### Scenario: Admin can enter mobile support workflow

- **WHEN** a user with role `ADMIN` logs in successfully on mobile
- **THEN** the app may navigate to the alerts workflow for support/testing and remains subject to backend authorization

#### Scenario: Unsupported role is blocked

- **WHEN** a user with role `RESEARCHER` or `SYSTEM_GENERATOR` logs in successfully on mobile
- **THEN** the app does not navigate to alert review, observation capture, or sync workflows and shows an access-denied state

### Requirement: Mobile observation destination visibility

The mobile client SHALL make the local and synchronized destination of captured observations verifiable during release validation.

#### Scenario: Saved observation is visible as pending locally

- **WHEN** a field operator saves an observation for an alert
- **THEN** the mobile client stores it in local SQLite as a pending observation and exposes a pending sync count that includes the queued observation

#### Scenario: Synced observation records backend id locally

- **WHEN** the backend confirms observation synchronization
- **THEN** the mobile client marks the local pending observation and queue item as `SYNCED` and stores the returned server id

### Requirement: Mobile observation sync traceability

The mobile client SHALL preserve the client-generated `observationId`, `alertId`, `comment`, original `createdAt`, and `clientId` from local capture through the sync request.

#### Scenario: Sync request carries captured observation fields

- **WHEN** the mobile client syncs a pending observation
- **THEN** the `POST /api/v1/sync/observations` request includes the same observation fields that were saved locally

### Requirement: Mobile user-scoped offline data

The mobile client SHALL scope locally stored observations, sync queue items, and user-visible pending sync counts to the authenticated user.

#### Scenario: User sees only own pending observations

- **WHEN** user A saves a pending observation on a shared device and user B later logs in on the same device
- **THEN** user B does not see user A's pending observation in local observation or sync status views

#### Scenario: User syncs only own pending observations

- **WHEN** user B starts mobile sync on a device that also contains pending observations created by user A
- **THEN** the mobile client sends only user B's pending observations to `POST /api/v1/sync/observations`

#### Scenario: Connectivity restore respects active user

- **WHEN** connectivity is restored on mobile
- **THEN** automatic sync processes pending observations only for the currently authenticated supported user and skips sync when no valid supported session exists

#### Scenario: User ownership is stored with local records

- **WHEN** a field operator saves an observation locally
- **THEN** the pending observation and its sync queue item include the authenticated user's id for repository filtering and auditability
