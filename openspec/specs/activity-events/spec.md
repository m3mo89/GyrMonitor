# Activity Events Specification

## Purpose

Define the MVP activity-event capability for registering activity and inactivity records associated with cattle, aligned with `knowledge-base/10-roadmap/phase-5-activity-events.md`, `knowledge-base/02-domain/activity-events.md`, and `knowledge-base/05-api/activity-events.md`.

## Requirements

### Requirement: Activity event domain record

The system SHALL represent activity and inactivity events with the MVP fields and rules documented in `knowledge-base/02-domain/activity-events.md`.

#### Scenario: Event preserves traceability fields

- **WHEN** a valid activity event is persisted
- **THEN** it includes a stable backend id, client/system `eventId`, existing `cattleId`, `eventType`, optional `inactiveMinutes`, `confidence`, `capturedAt`, `source`, and backend `createdAt`

#### Scenario: Capture time is preserved

- **WHEN** an event is registered with a valid `capturedAt` timestamp
- **THEN** the persisted event keeps that real capture time instead of replacing it with server receipt time

#### Scenario: Source is recorded without source-specific rules

- **WHEN** an event is accepted from a manual, simulator, desktop, mobile, or controlled-test source allowed by the knowledge base
- **THEN** the persisted event records the source while business validation remains independent of the specific source implementation

### Requirement: Activity event registration API

The backend SHALL expose protected `POST /api/v1/events` behavior aligned with `knowledge-base/05-api/activity-events.md`.

#### Scenario: System generator registers inactivity event

- **WHEN** an authenticated `SYSTEM_GENERATOR` posts a valid inactivity event for an existing cattle record
- **THEN** the API returns `201` with a successful registration response containing the accepted `eventId` and risk/alert integration fields in the documented response shape

#### Scenario: Admin registers activity event

- **WHEN** an authenticated `ADMIN` posts a valid activity event for an existing cattle record
- **THEN** the API returns `201` and persists the event

#### Scenario: Unauthorized role cannot register event

- **WHEN** an authenticated user without Register Activity Event permission posts an event
- **THEN** the API returns `FORBIDDEN`

#### Scenario: Missing token cannot register event

- **WHEN** a request without a valid bearer token is made to `POST /api/v1/events`
- **THEN** the API returns `UNAUTHORIZED`

#### Scenario: Unknown cattle is rejected

- **WHEN** an authorized caller posts a valid event payload for a cattle id that does not exist
- **THEN** the API returns the standardized not-found error response

### Requirement: Activity event validation

The backend SHALL validate activity-event payloads against the DTO, enum, and business-rule documents in `knowledge-base/`.

#### Scenario: Invalid event type is rejected

- **WHEN** an authorized caller posts an event whose `eventType` is not an approved `EventType`
- **THEN** the API returns the standardized validation error response

#### Scenario: Inactivity duration is required for inactivity

- **WHEN** an authorized caller posts an `INACTIVITY` event without a valid `inactiveMinutes` value
- **THEN** the API returns the standardized validation error response

#### Scenario: Activity event does not require inactivity duration

- **WHEN** an authorized caller posts an `ACTIVITY` event without `inactiveMinutes`
- **THEN** validation does not fail solely because inactivity duration is absent

#### Scenario: Invalid confidence is rejected

- **WHEN** an authorized caller posts an event whose `confidence` is outside the documented 0 to 1 range
- **THEN** the API returns the standardized validation error response

### Requirement: Activity event idempotency

The system SHALL avoid duplicate event records when producers retry creation with the same `eventId`, as required by `knowledge-base/02-domain/activity-events.md` and `knowledge-base/03-requirements/business-rules.md`.

#### Scenario: Duplicate event id returns existing event

- **WHEN** an authorized caller repeats event registration with an `eventId` that has already been persisted
- **THEN** the system returns the existing event registration result instead of creating another record

#### Scenario: Idempotency key retry does not duplicate record

- **WHEN** an authorized caller retries `POST /api/v1/events` with the same accepted event payload and idempotency context
- **THEN** the system does not create more than one persisted event for the same `eventId`

### Requirement: Activity event listing API

The backend SHALL expose protected `GET /api/v1/events` behavior for event consultation using the filters documented in `knowledge-base/05-api/activity-events.md`.

#### Scenario: Admin lists events

- **WHEN** an authenticated `ADMIN` requests `GET /api/v1/events`
- **THEN** the API returns a successful response containing event list items and pagination metadata

#### Scenario: Researcher lists events

- **WHEN** an authenticated `RESEARCHER` requests `GET /api/v1/events`
- **THEN** the API returns a successful response containing event list items and pagination metadata

#### Scenario: Event list filters by cattle

- **WHEN** an authorized caller requests events with a valid `cattleId` filter
- **THEN** the response only includes events associated with that cattle record

#### Scenario: Event list filters by type and period

- **WHEN** an authorized caller requests events with valid `eventType`, `from`, and `to` filters
- **THEN** the response only includes matching events using `capturedAt` as the event time

#### Scenario: Unauthorized role cannot list events

- **WHEN** an authenticated user without event consultation permission requests `GET /api/v1/events`
- **THEN** the API returns `FORBIDDEN`

### Requirement: Activity event risk and alert integration boundary

The activity-event module SHALL invoke the backend risk-analysis and alert-generation boundary for accepted inactivity events while preserving source-event traceability.

#### Scenario: Inactivity event is evaluated for alert generation

- **WHEN** an `INACTIVITY` event is accepted
- **THEN** the event is made available to the backend risk-analysis boundary for deterministic evaluation and alert threshold handling

#### Scenario: Inactivity event above threshold returns alert integration data

- **WHEN** an `INACTIVITY` event is accepted and alert generation creates a linked alert
- **THEN** event registration returns the accepted event result with alert integration fields in the documented activity-event response shape

#### Scenario: Inactivity event below threshold returns no generated alert

- **WHEN** an `INACTIVITY` event is accepted and risk analysis does not cross the alert threshold
- **THEN** event registration succeeds without reporting a generated alert

#### Scenario: Activity event does not generate alert by default

- **WHEN** an `ACTIVITY` event is accepted
- **THEN** the system does not treat it as an alert-generating inactivity event by default

#### Scenario: Alert generation remains traceable to source event

- **WHEN** alert generation consumes an activity event
- **THEN** the persisted alert links back to the source event using the event's cattle, event id, capture time, inactivity duration, and source data

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

