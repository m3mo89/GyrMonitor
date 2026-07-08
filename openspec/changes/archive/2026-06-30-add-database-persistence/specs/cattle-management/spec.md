## ADDED Requirements

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
