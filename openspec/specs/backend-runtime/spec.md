# Backend Runtime Specification

## Purpose

Define the backend runtime startup, HTTP availability, package script, and smoke verification requirements for the NestJS API.

## Requirements

### Requirement: Backend runtime bootstrap
The backend SHALL bootstrap a real NestJS application from the existing application module and listen for HTTP requests on the configured port.

#### Scenario: Backend starts with application module
- **WHEN** a developer starts the backend runtime
- **THEN** the process creates a Nest application using `AppModule`

#### Scenario: Backend listens on configured port
- **WHEN** the backend runtime starts with a configured port
- **THEN** the HTTP server listens on that port

#### Scenario: API prefix is applied
- **WHEN** the backend runtime starts with the configured API prefix
- **THEN** HTTP routes are served beneath that prefix

### Requirement: Backend runtime scripts
The backend package SHALL expose discoverable commands for local development, compiled start, and HTTP smoke verification.

#### Scenario: Developer starts backend in development mode
- **WHEN** a developer runs the backend development script
- **THEN** the backend starts from TypeScript source with development-oriented behavior

#### Scenario: Developer starts compiled backend
- **WHEN** a developer builds the backend and runs the backend start script
- **THEN** the backend starts from the compiled output

#### Scenario: Developer discovers smoke test
- **WHEN** a developer inspects backend package scripts
- **THEN** an HTTP smoke test command is available

### Requirement: Public runtime availability endpoint
The backend SHALL expose a public HTTP availability endpoint suitable for runtime smoke testing without authentication or seed data.

#### Scenario: Availability endpoint responds
- **WHEN** the backend is running and a client requests the availability endpoint
- **THEN** the backend returns a successful HTTP response

#### Scenario: Availability endpoint is under API prefix
- **WHEN** the backend is configured with the default API prefix
- **THEN** the availability endpoint is reachable under `/api/v1`

#### Scenario: Availability endpoint does not expose secrets
- **WHEN** the availability endpoint responds
- **THEN** the response does not include secrets, database URLs, tokens, or private credentials

### Requirement: HTTP smoke test
The backend SHALL provide an automated smoke test that starts the runtime and verifies HTTP availability.

#### Scenario: Smoke test passes for healthy runtime
- **WHEN** the HTTP smoke test command is run in a prepared development environment
- **THEN** it starts the backend, receives a successful response from the availability endpoint, and exits successfully

#### Scenario: Smoke test fails when runtime cannot start
- **WHEN** the backend process exits before serving HTTP
- **THEN** the smoke test exits with a failure

#### Scenario: Smoke test cleans up backend process
- **WHEN** the HTTP smoke test completes or fails
- **THEN** the backend process started by the smoke test is terminated
