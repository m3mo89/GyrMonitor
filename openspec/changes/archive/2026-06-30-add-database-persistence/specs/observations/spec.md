## ADDED Requirements

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
