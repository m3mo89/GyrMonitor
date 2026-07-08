## ADDED Requirements

### Requirement: Backend unit test execution

The backend SHALL provide a unit test command that runs automated tests for application use cases without requiring MariaDB or external services.

#### Scenario: Unit tests run from backend package

- **WHEN** a developer runs the backend unit test command
- **THEN** the command executes TypeScript unit tests for backend use cases and exits non-zero on failing assertions

#### Scenario: Unit tests use deterministic collaborators

- **WHEN** a use case depends on repositories, clocks, ID generation, password hashing, or token issuing
- **THEN** its unit tests use deterministic fakes or stubs instead of real infrastructure

### Requirement: Use case behavior coverage

The backend SHALL include real unit tests for current application use cases that verify successful outcomes, validation failures, not-found failures, and idempotency where the use case supports it.

#### Scenario: Authentication use case coverage

- **WHEN** login input is valid, missing, or has invalid credentials
- **THEN** unit tests verify token response behavior and the expected authentication errors

#### Scenario: Activity event use case coverage

- **WHEN** an activity event is registered for existing cattle, duplicated by event ID, invalid, or references missing cattle
- **THEN** unit tests verify saved data, idempotent response behavior, validation errors, and not-found errors

#### Scenario: Cattle and observation use case coverage

- **WHEN** cattle detail/history/listing or alert observation use cases receive valid and invalid inputs
- **THEN** unit tests verify returned DTOs and domain-specific errors without using real persistence

### Requirement: Backend e2e test execution

The backend SHALL provide an e2e test command that runs HTTP tests against NestJS controllers without requiring MariaDB by default.

#### Scenario: E2e tests run from backend package

- **WHEN** a developer runs the backend e2e test command
- **THEN** the command starts a Nest testing application, executes HTTP requests against controllers, and exits non-zero on failing assertions

#### Scenario: E2e tests avoid real database dependency

- **WHEN** e2e tests exercise controller routes
- **THEN** they use test providers, fake repositories, or controlled guards instead of connecting to MariaDB

### Requirement: Controller HTTP contract coverage

The backend SHALL include e2e tests around current controllers that verify route behavior, success envelopes, error envelopes, authentication, authorization, and pagination envelopes where applicable.

#### Scenario: Authentication controller contract

- **WHEN** a login request succeeds, fails validation, or uses invalid credentials
- **THEN** e2e tests verify the HTTP status and `success` response envelope

#### Scenario: Protected controller contract

- **WHEN** cattle, activity event, or observation routes are called without authentication or with an unauthorized role
- **THEN** e2e tests verify unauthorized or forbidden HTTP responses

#### Scenario: Domain controller contract

- **WHEN** cattle, activity event, or observation routes return success, validation errors, or not-found errors
- **THEN** e2e tests verify HTTP status codes, response envelopes, DTO shape, and pagination metadata where applicable

### Requirement: Combined backend test command

The backend SHALL provide a default test command that runs the real unit and e2e test suites.

#### Scenario: Default test command runs real suites

- **WHEN** a developer runs the backend default test command
- **THEN** both unit and e2e tests are executed rather than a placeholder-only foundation check
