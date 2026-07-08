## ADDED Requirements

### Requirement: Alert domain record

The system SHALL represent alerts with the MVP fields, status values, severity values, and traceability relationships documented in `knowledge-base/02-domain/alerts.md`.

#### Scenario: New alert has required traceability

- **WHEN** the backend creates an alert from an eligible inactivity event
- **THEN** the alert includes a stable id, cattle id, source event id, severity, risk score, status, reason, and creation timestamp

#### Scenario: New alert starts pending

- **WHEN** an alert is created
- **THEN** its status is `PENDING`

#### Scenario: Alert severity follows risk result

- **WHEN** an alert is created from risk analysis
- **THEN** its severity is consistent with the calculated risk score according to the deterministic MVP policy

### Requirement: Alert generation from inactivity

The backend SHALL evaluate accepted inactivity events and generate alerts when risk analysis determines that attention is required, as described in `knowledge-base/10-roadmap/phase-6-alerts.md` and `knowledge-base/02-domain/risk-analysis.md`.

#### Scenario: Inactivity above threshold creates alert

- **WHEN** an authorized caller registers a valid `INACTIVITY` event whose calculated risk score exceeds the alert threshold
- **THEN** the backend persists a new `PENDING` alert linked to the same cattle record and source activity event

#### Scenario: Inactivity below threshold does not create alert

- **WHEN** an authorized caller registers a valid `INACTIVITY` event whose calculated risk score does not exceed the alert threshold
- **THEN** the backend persists the event without creating an alert

#### Scenario: Activity event does not create alert

- **WHEN** an authorized caller registers a valid `ACTIVITY` event
- **THEN** the backend does not create an alert from that event by default

#### Scenario: Duplicate event does not duplicate alert

- **WHEN** event registration is retried with an `eventId` that already generated an alert
- **THEN** the backend does not create an additional alert for the same source event

### Requirement: Alert listing API

The backend SHALL expose protected `GET /api/v1/alerts` behavior aligned with `knowledge-base/05-api/alerts.md`.

#### Scenario: Authorized user lists alerts

- **WHEN** an authenticated `ADMIN`, `FIELD_OPERATOR`, or `RESEARCHER` requests `GET /api/v1/alerts`
- **THEN** the API returns a successful alert list response using the documented list item shape

#### Scenario: Alert list filters by status and severity

- **WHEN** an authorized caller requests alerts with valid `status` or `severity` filters
- **THEN** the response only includes alerts matching those filters

#### Scenario: Alert list filters by cattle

- **WHEN** an authorized caller requests alerts with a valid `cattleId` filter
- **THEN** the response only includes alerts linked to that cattle record

#### Scenario: Alert list paginates results

- **WHEN** an authorized caller requests alerts with valid `page` and `pageSize`
- **THEN** the API returns the corresponding page without changing alert ordering or filter semantics

#### Scenario: Missing token cannot list alerts

- **WHEN** a request without a valid bearer token is made to `GET /api/v1/alerts`
- **THEN** the API returns `UNAUTHORIZED`

### Requirement: Alert detail API

The backend SHALL expose protected `GET /api/v1/alerts/{id}` behavior aligned with `knowledge-base/05-api/alerts.md`.

#### Scenario: Authorized user gets alert detail

- **WHEN** an authenticated `ADMIN`, `FIELD_OPERATOR`, or `RESEARCHER` requests an existing alert by id
- **THEN** the API returns the alert detail with cattle, source event, risk, severity, status, reason, and timestamp data needed for field review

#### Scenario: Unknown alert returns not found

- **WHEN** an authorized caller requests an alert id that does not exist
- **THEN** the API returns the standardized not-found error response

#### Scenario: Missing token cannot view detail

- **WHEN** a request without a valid bearer token is made to `GET /api/v1/alerts/{id}`
- **THEN** the API returns `UNAUTHORIZED`

### Requirement: Alert status lifecycle

The backend SHALL allow authorized users to update alert status while enforcing the lifecycle documented in `knowledge-base/02-domain/alerts.md`.

#### Scenario: Field operator marks alert in progress

- **WHEN** an authenticated `FIELD_OPERATOR` patches an existing `PENDING` alert to `IN_PROGRESS`
- **THEN** the backend persists the new status and returns the documented successful status response

#### Scenario: Field operator marks alert attended

- **WHEN** an authenticated `FIELD_OPERATOR` or `ADMIN` patches a `PENDING` or `IN_PROGRESS` alert to `ATTENDED` with a valid attended timestamp
- **THEN** the backend persists status `ATTENDED` and records `attendedAt`

#### Scenario: Attended alert requires attended timestamp

- **WHEN** an authorized caller patches an alert to `ATTENDED` without a valid `attendedAt`
- **THEN** the API returns the standardized validation error response

#### Scenario: Invalid status transition is rejected

- **WHEN** an authorized caller attempts a status transition outside the documented lifecycle
- **THEN** the API returns the standardized validation error response and leaves the alert unchanged

#### Scenario: Unauthorized role cannot update alert status

- **WHEN** an authenticated user without alert status update permission patches `PATCH /api/v1/alerts/{id}/status`
- **THEN** the API returns `FORBIDDEN`

### Requirement: Persisted alert repository

The backend SHALL persist alerts in MariaDB while preserving filtering, status updates, and relationships required by `knowledge-base/02-domain/alerts.md` and `knowledge-base/06-engineering/database/migrations.md`.

#### Scenario: Alert survives backend restart

- **WHEN** an alert is generated and the backend restarts
- **THEN** the alert remains available through alert listing and detail APIs

#### Scenario: Alert references existing cattle and event

- **WHEN** an alert is persisted from an inactivity event
- **THEN** the database enforces references to the existing cattle record and source activity event

#### Scenario: Alert filters use persisted data

- **WHEN** an authorized caller filters alerts by status, severity, cattle, or page
- **THEN** the response is computed from persisted MariaDB alert records

#### Scenario: Source event uniqueness prevents duplicate generated alerts

- **WHEN** two creation attempts target the same source activity event
- **THEN** persistence prevents duplicate generated alerts for that event
