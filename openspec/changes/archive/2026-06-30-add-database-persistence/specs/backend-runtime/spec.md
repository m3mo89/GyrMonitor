## ADDED Requirements

### Requirement: Database-aware backend runtime
The backend runtime SHALL initialize the configured MariaDB persistence infrastructure before serving database-backed protected workflows.

#### Scenario: Runtime starts with database connection
- **WHEN** the backend starts with valid MariaDB configuration
- **THEN** repository providers can use the configured database connection for protected module workflows

#### Scenario: Runtime rejects unavailable database for persisted workflows
- **WHEN** the backend starts in database-backed mode and MariaDB is unavailable
- **THEN** the runtime fails startup or reports a failed database-aware smoke check instead of serving protected workflows from empty in-memory state

### Requirement: Database operational scripts
The backend package SHALL expose discoverable commands for running migrations, seed data, and database-aware verification.

#### Scenario: Developer discovers migration script
- **WHEN** a developer inspects backend package scripts
- **THEN** a command for applying database migrations is available

#### Scenario: Developer discovers seed script
- **WHEN** a developer inspects backend package scripts
- **THEN** a command for loading development or test seed data is available

#### Scenario: Database smoke verification is available
- **WHEN** a developer inspects backend package scripts
- **THEN** a command is available to verify migrated MariaDB-backed repository behavior
