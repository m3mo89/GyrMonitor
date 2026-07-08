## ADDED Requirements

### Requirement: Persisted activity event repository

The backend SHALL persist activity and inactivity events in MariaDB while preserving existing validation, idempotency, listing, and filtering behavior.

#### Scenario: Registered event survives restart

- **WHEN** an authorized caller registers a valid activity event and the backend restarts
- **THEN** the event remains available through activity-event listing and cattle history APIs

#### Scenario: Event capture time is stored in UTC

- **WHEN** an event is persisted with a valid `capturedAt` timestamp
- **THEN** MariaDB storage and repository mapping preserve that capture time as a UTC API timestamp

#### Scenario: Duplicate event id is handled by persistence

- **WHEN** two requests attempt to persist the same `eventId`
- **THEN** the database uniqueness constraint prevents duplicate event rows and the repository returns the existing event result

#### Scenario: Event list filters use persisted data

- **WHEN** an authorized caller requests events with `cattleId`, `eventType`, `from`, or `to` filters
- **THEN** the response is computed from persisted MariaDB events using `capturedAt` as the event time

#### Scenario: Unknown cattle validation uses persisted cattle

- **WHEN** an authorized caller posts an event for a cattle id that is not present in MariaDB
- **THEN** the API returns the standardized not-found error response

### Requirement: Activity event relational integrity

Persisted activity events SHALL maintain database relationships needed for downstream risk and alert traceability.

#### Scenario: Event references existing cattle

- **WHEN** an activity event is inserted
- **THEN** the database enforces that its cattle id references an existing cattle record

#### Scenario: Alert source can reference event

- **WHEN** a later alert-generation capability creates an alert from an inactivity event
- **THEN** the schema supports linking that alert to the persisted source event
