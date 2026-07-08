## ADDED Requirements

### Requirement: Observation domain record

The system SHALL represent textual field observations with the MVP fields and rules documented in `knowledge-base/02-domain/observations.md`.

#### Scenario: Observation preserves traceability fields

- **WHEN** an observation is created for an alert
- **THEN** it includes a stable backend id, client-provided `observationId`, `alertId`, authenticated `userId`, non-empty `comment`, original `createdAt`, and optional `clientId`

#### Scenario: Empty comment is rejected

- **WHEN** an authorized user attempts to create an observation with an empty or whitespace-only comment
- **THEN** the system rejects the request with the standardized validation error response

### Requirement: Alert-scoped observation creation API

The backend SHALL expose protected `POST /api/v1/alerts/{id}/observations` behavior aligned with `knowledge-base/05-api/observations.md`.

#### Scenario: Field operator creates observation

- **WHEN** an authenticated `FIELD_OPERATOR` posts a valid observation request for an existing alert
- **THEN** the API returns `201` with the created observation data and the authenticated user's id as `userId`

#### Scenario: Admin creates observation

- **WHEN** an authenticated `ADMIN` posts a valid observation request for an existing alert
- **THEN** the API returns `201` with the created observation data and the authenticated user's id as `userId`

#### Scenario: Unauthorized role cannot create observation

- **WHEN** an authenticated user without Add Observation permission posts an observation request
- **THEN** the API returns `FORBIDDEN`

#### Scenario: Missing token cannot create observation

- **WHEN** a request without a valid bearer token is made to `POST /api/v1/alerts/{id}/observations`
- **THEN** the API returns `UNAUTHORIZED`

#### Scenario: Unknown alert is rejected

- **WHEN** an authorized user posts a valid observation request for an alert id that does not exist
- **THEN** the API returns the standardized not-found error response

### Requirement: Observation idempotency

The system SHALL avoid duplicate backend records when an offline client retries creation with the same `observationId`, as required by `knowledge-base/02-domain/observations.md`.

#### Scenario: Duplicate observation id returns existing observation

- **WHEN** an authorized user repeats observation creation with an `observationId` that has already been persisted
- **THEN** the system returns the existing observation instead of creating another record

#### Scenario: Offline creation timestamp is preserved

- **WHEN** an authorized user submits an observation with a valid client-side `createdAt` timestamp
- **THEN** the persisted observation keeps that original timestamp rather than replacing it with server receipt time

### Requirement: Alert observation consultation

The system SHALL allow observations to be consulted from alert context for traceability, following RF-14 in `knowledge-base/03-requirements/functional-requirements.md`.

#### Scenario: Authorized user lists alert observations

- **WHEN** an authenticated `ADMIN`, `FIELD_OPERATOR`, or `RESEARCHER` requests observations for an existing alert
- **THEN** the API returns the observations associated with that alert in a successful response

#### Scenario: Unknown alert observations return not found

- **WHEN** an authenticated authorized user requests observations for an alert id that does not exist
- **THEN** the API returns the standardized not-found error response
