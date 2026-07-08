## ADDED Requirements

### Requirement: MVP release smoke validation

The project SHALL define a release smoke validation path that proves the MVP login, desktop simulation, sync, alert visibility, mobile observation capture, observation sync, and backend persistence flows operate together.

#### Scenario: Desktop event reaches backend and can generate alert context

- **WHEN** the release smoke run logs in on desktop, selects a cattle record, generates an inactivity event, and syncs pending events
- **THEN** the backend receives the event through `POST /api/v1/sync/events` without duplicate records and the alert/dashboard flows can reflect the resulting backend state

#### Scenario: Mobile observation reaches backend

- **WHEN** the release smoke run logs in on mobile, opens an alert, saves an observation, and syncs pending observations
- **THEN** the observation is persisted through `POST /api/v1/sync/observations` and is returned by alert observation consultation

### Requirement: Release validation evidence

The release stabilization workflow SHALL record enough evidence to diagnose whether a failure occurred in local client storage, sync transport, backend processing, or backend persistence.

#### Scenario: Failed smoke run identifies failure boundary

- **WHEN** a release smoke validation step fails
- **THEN** the validation output or checklist identifies the relevant boundary among local SQLite queue, sync API response, backend sync log, and persisted event or observation data

#### Scenario: Successful smoke run includes test commands

- **WHEN** the release smoke validation completes successfully
- **THEN** the executed backend and client core test commands are recorded with their pass/fail result

### Requirement: Multi-user mobile smoke validation

The release smoke validation path SHALL verify that mobile offline observations are isolated between authenticated users on the same device.

#### Scenario: Second mobile user cannot sync first user's pending observation

- **WHEN** user A saves a pending mobile observation, signs out, and user B signs in on the same device
- **THEN** user B's pending sync count and sync request exclude user A's pending observation

#### Scenario: Unsupported mobile role cannot enter workflow

- **WHEN** a `RESEARCHER` or `SYSTEM_GENERATOR` account signs in on mobile during release validation
- **THEN** the app blocks access to alert review, observation capture, and sync workflows
