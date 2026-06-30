## ADDED Requirements

### Requirement: Persisted user identity storage
The backend SHALL load authentication users from MariaDB while preserving existing user identity and password secrecy guarantees.

#### Scenario: Login uses persisted user
- **WHEN** a user submits valid credentials for a seeded or persisted user
- **THEN** the login flow authenticates against the MariaDB user record and returns the documented login response

#### Scenario: Persisted password hash remains private
- **WHEN** login succeeds for a persisted user
- **THEN** the response excludes password hashes, raw passwords, and password metadata

#### Scenario: Persisted roles use approved values
- **WHEN** a user identity is loaded from MariaDB
- **THEN** its role matches one of the documented role values before protected endpoint authorization uses it

#### Scenario: Email uniqueness is enforced
- **WHEN** seed or persistence data prepares users
- **THEN** no two persisted user records share the same normalized email
