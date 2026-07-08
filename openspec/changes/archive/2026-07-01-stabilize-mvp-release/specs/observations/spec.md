## ADDED Requirements

### Requirement: Mobile-to-backend observation traceability

The observations capability SHALL support release validation from a mobile captured observation through backend persistence and alert-scoped consultation.

#### Scenario: Synced mobile observation is consultable by alert

- **WHEN** a mobile observation is synchronized successfully through `POST /api/v1/sync/observations`
- **THEN** the observation is returned by `GET /api/v1/alerts/{id}/observations` for the related alert

#### Scenario: Synced mobile observation preserves client identifiers

- **WHEN** a mobile observation is persisted through synchronization
- **THEN** the backend record preserves the client-provided `observationId`, `clientId`, and original `createdAt`

### Requirement: Duplicate mobile observation retry traceability

The observations capability SHALL return the existing backend observation when mobile retries a previously synchronized `observationId`.

#### Scenario: Retried mobile observation returns existing backend record

- **WHEN** mobile retries synchronization for an observation whose `observationId` already exists
- **THEN** the backend does not create another observation and returns a duplicate or existing-record outcome that includes the existing server id
