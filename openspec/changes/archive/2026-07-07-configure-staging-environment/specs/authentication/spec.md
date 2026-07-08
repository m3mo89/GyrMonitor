## ADDED Requirements

### Requirement: Environment login verification

Authentication SHALL be verifiable in each environment using the public login endpoint, configured browser origin, and prepared persisted users.

#### Scenario: Development login succeeds with prepared user

- **WHEN** the local database has migrations applied and contains a valid local user
- **THEN** `POST /api/v1/auth/login` from an allowed local frontend origin returns the documented successful login response for valid credentials

#### Scenario: Staging login succeeds with prepared user

- **WHEN** the staging database has migrations applied and contains a valid staging user
- **THEN** `POST /api/v1/auth/login` from the allowed staging frontend origin returns the documented successful login response for valid credentials

#### Scenario: Production login succeeds with provisioned user

- **WHEN** the production database has migrations applied and contains a valid provisioned production user
- **THEN** `POST /api/v1/auth/login` from `https://gyr-monitor.vercel.app` returns the documented successful login response for valid credentials

#### Scenario: Environment login reports invalid credentials

- **WHEN** the backend receives unknown or invalid credentials from an allowed origin
- **THEN** the API returns the documented standardized `UNAUTHORIZED` response

#### Scenario: Missing environment user is diagnosable

- **WHEN** the environment database has no prepared user matching the submitted credentials
- **THEN** the verification guidance identifies missing seed/provisioning as a likely cause after API reachability and CORS have been confirmed
