# Observations Specification

## Purpose

Define the MVP observation capability for field inspection notes associated with alerts, aligned with `knowledge-base/10-roadmap/phase-4-observations.md`, `knowledge-base/02-domain/observations.md`, and `knowledge-base/05-api/observations.md`.

## Requirements

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

### Requirement: Duplicate mobile observation retry traceability
The observations capability SHALL return the existing backend observation when mobile retries a previously synchronized `observationId`.

#### Scenario: Retried mobile observation returns existing backend record
- **WHEN** mobile retries synchronization for an observation whose `observationId` already exists
- **THEN** the backend does not create another observation and returns a duplicate or existing-record outcome that includes the existing server id

### Requirement: Alert observation consultation
The system SHALL allow observations to be consulted from alert context for traceability, following RF-14 in `knowledge-base/03-requirements/functional-requirements.md`.

#### Scenario: Authorized user lists alert observations
- **WHEN** an authenticated `ADMIN`, `FIELD_OPERATOR`, or `RESEARCHER` requests observations for an existing alert
- **THEN** the API returns the observations associated with that alert in a successful response

#### Scenario: Unknown alert observations return not found
- **WHEN** an authenticated authorized user requests observations for an alert id that does not exist
- **THEN** the API returns the standardized not-found error response

### Requirement: Mobile-to-backend observation traceability
The observations capability SHALL support release validation from a mobile captured observation through backend persistence and alert-scoped consultation.

#### Scenario: Synced mobile observation is consultable by alert
- **WHEN** a mobile observation is synchronized successfully through `POST /api/v1/sync/observations`
- **THEN** the observation is returned by `GET /api/v1/alerts/{id}/observations` for the related alert

#### Scenario: Synced mobile observation preserves client identifiers
- **WHEN** a mobile observation is persisted through synchronization
- **THEN** the backend record preserves the client-provided `observationId`, `clientId`, and original `createdAt`

### Requirement: Persisted observation repository
The backend SHALL persist alert observations in MariaDB while preserving alert-scoped creation, idempotency, timestamp preservation, and consultation behavior.

#### Scenario: Created observation survives restart
- **WHEN** an authorized user creates an observation for an existing alert and the backend restarts
- **THEN** the observation remains available through alert observation consultation

#### Scenario: Duplicate observation id is handled by persistence
- **WHEN** an offline client retries creation with an `observationId` that already exists
- **THEN** the database uniqueness constraint prevents duplicate observation rows and the repository returns the existing observation

#### Scenario: Offline timestamp is stored in UTC
- **WHEN** an authorized user submits an observation with a valid client-side `createdAt` timestamp
- **THEN** MariaDB storage and repository mapping preserve that original timestamp as a UTC API timestamp

#### Scenario: Alert observation list uses persisted data
- **WHEN** an authorized user lists observations for an existing alert
- **THEN** the response is computed from persisted MariaDB observations associated with that alert

### Requirement: Persisted alert lookup for observations
The backend SHALL validate observation alert references against persisted alert records.

#### Scenario: Existing persisted alert accepts observation
- **WHEN** an authorized user posts a valid observation for an alert id present in MariaDB
- **THEN** the API creates the observation successfully

#### Scenario: Unknown persisted alert rejects observation
- **WHEN** an authorized user posts a valid observation for an alert id not present in MariaDB
- **THEN** the API returns the standardized not-found error response
