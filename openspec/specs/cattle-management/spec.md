# Cattle Management Specification

## Purpose

Define the cattle reference foundation for GyrMonitor, including MVP cattle records, protected cattle list/detail access, event-backed cattle history, seed data, and frontend cattle list/detail workflows.

## Requirements

### Requirement: Cattle reference model

The system SHALL provide cattle reference records with the MVP fields and business rules documented in `knowledge-base/02-domain/cattle.md`.

#### Scenario: Cattle record exposes MVP fields

- **WHEN** a cattle record is loaded for list or detail use
- **THEN** it includes a stable UUID, unique `tagNumber`, breed, sex, status, creation timestamp, and any documented optional detail fields available for that record

#### Scenario: Tag number is unique

- **WHEN** cattle seed or persistence data is prepared
- **THEN** no two cattle records share the same `tagNumber`

#### Scenario: Breed defaults to Gyr

- **WHEN** an MVP cattle record is created by seed/support infrastructure without an explicit breed
- **THEN** the breed is stored or exposed as `Gyr`

### Requirement: Cattle list API

The backend SHALL expose protected `GET /api/v1/cattle` behavior aligned with `knowledge-base/05-api/cattle.md`.

#### Scenario: Authorized user lists cattle

- **WHEN** an authenticated `ADMIN` or `RESEARCHER` requests `GET /api/v1/cattle`
- **THEN** the API returns a successful response containing cattle summaries and pagination metadata

#### Scenario: Unauthorized role cannot list cattle

- **WHEN** an authenticated user without cattle-list permission requests `GET /api/v1/cattle`
- **THEN** the API returns `FORBIDDEN`

#### Scenario: Missing token cannot list cattle

- **WHEN** a request without a valid bearer token is made to `GET /api/v1/cattle`
- **THEN** the API returns `UNAUTHORIZED`

### Requirement: Cattle detail API

The backend SHALL expose protected `GET /api/v1/cattle/{id}` behavior for consulting one cattle record by UUID.

#### Scenario: Authorized user views cattle detail

- **WHEN** an authenticated `ADMIN` or `RESEARCHER` requests an existing cattle UUID
- **THEN** the API returns a successful response containing the cattle detail fields documented for the MVP

#### Scenario: Unknown cattle id returns not found

- **WHEN** an authenticated authorized user requests a cattle UUID that does not exist
- **THEN** the API returns the standardized not-found error response

#### Scenario: Invalid cattle id is rejected

- **WHEN** an authenticated authorized user requests cattle detail with a malformed id
- **THEN** the API returns the standardized validation error response

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

### Requirement: MVP cattle seed data

The system SHALL include MVP cattle seed data sufficient to test cattle list, cattle detail, and later references by UUID.

#### Scenario: Seed data supports list and detail workflows

- **WHEN** the local or test seed process runs
- **THEN** it creates cattle records with UUIDs, human-readable tag numbers, allowed sex/status values, and enough variation to verify list and detail behavior

#### Scenario: Later modules can reference cattle ids

- **WHEN** a seeded cattle record is used by another module in a test or fixture
- **THEN** the record can be referenced by its stable UUID

### Requirement: Frontend cattle list

The frontend SHALL provide a protected cattle list workflow under the cattle feature boundary.

#### Scenario: Authorized user views cattle list

- **WHEN** an authenticated `ADMIN` or `RESEARCHER` navigates to the cattle list route
- **THEN** the frontend requests the cattle list API and displays cattle summaries with tag number, breed, sex, status, and available risk summary data

#### Scenario: Cattle list handles empty data

- **WHEN** the cattle list API returns no cattle records
- **THEN** the frontend displays an empty state without treating the response as an error

#### Scenario: Cattle list handles API failure

- **WHEN** the cattle list API returns an error
- **THEN** the frontend displays an error state and does not show stale cattle records as current data

### Requirement: Frontend cattle detail

The frontend SHALL provide a protected cattle detail workflow that consults one cattle record and reserves space for future history.

#### Scenario: Authorized user views cattle detail

- **WHEN** an authenticated `ADMIN` or `RESEARCHER` opens an existing cattle record from the list
- **THEN** the frontend displays the cattle detail returned by the API and a clearly placeholder history area

#### Scenario: Cattle detail handles not found

- **WHEN** the cattle detail API returns not found
- **THEN** the frontend displays a not-found state instead of a blank or broken detail view

#### Scenario: Cattle detail preserves navigation back to list

- **WHEN** a user is viewing cattle detail
- **THEN** the frontend provides a way to return to the cattle list without losing the protected application session

### Requirement: Persisted cattle repository

The backend SHALL serve cattle list, detail, existence checks, and seed support from MariaDB records.

#### Scenario: Cattle list survives restart

- **WHEN** the backend is restarted after migrations and seed data have run
- **THEN** an authorized cattle list request returns the persisted cattle records with pagination metadata

#### Scenario: Cattle detail uses persisted record

- **WHEN** an authorized user requests an existing persisted cattle UUID
- **THEN** the API returns the cattle detail for that MariaDB record

#### Scenario: Cattle existence uses persisted record

- **WHEN** another module validates a cattle UUID before creating a related record
- **THEN** the check uses MariaDB cattle data

#### Scenario: Tag uniqueness is enforced by persistence

- **WHEN** cattle seed or repository code attempts to store a duplicate tag number
- **THEN** persistence rejects the duplicate instead of creating two cattle records with the same `tagNumber`

### Requirement: Persisted cattle history source

The backend SHALL build cattle activity-event history from persisted activity events associated with the cattle record.

#### Scenario: Cattle history survives restart

- **WHEN** activity events have been persisted for a cattle record and the backend restarts
- **THEN** an authorized cattle history request returns those persisted events

#### Scenario: Cattle history preserves persisted ordering

- **WHEN** multiple persisted events exist for a cattle record
- **THEN** the returned history is ordered by `capturedAt` using the deterministic default ordering
