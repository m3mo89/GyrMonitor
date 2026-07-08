## MODIFIED Requirements

### Requirement: Cattle history contract placeholder

The backend SHALL expose protected `GET /api/v1/cattle/{id}/events` behavior as real cattle activity-event history aligned with `knowledge-base/10-roadmap/phase-5-activity-events.md`, `knowledge-base/02-domain/activity-events.md`, and `knowledge-base/05-api/activity-events.md`.

#### Scenario: Existing cattle history route returns events

- **WHEN** an authenticated `ADMIN` or `RESEARCHER` requests history for an existing cattle UUID
- **THEN** the API returns activity events associated with that cattle record, pagination metadata, and no placeholder marker

#### Scenario: Existing cattle with no events returns empty history

- **WHEN** an authenticated `ADMIN` or `RESEARCHER` requests history for an existing cattle UUID that has no activity events
- **THEN** the API returns an empty event list with pagination metadata without treating the response as an error

#### Scenario: Cattle history preserves event ordering

- **WHEN** cattle history contains multiple events
- **THEN** the returned events are ordered by `capturedAt` using a deterministic default ordering suitable for history review

#### Scenario: Unknown cattle history id returns not found

- **WHEN** an authenticated authorized user requests history for a cattle UUID that does not exist
- **THEN** the API returns the standardized not-found error response
