## MODIFIED Requirements

### Requirement: Database operational scripts
The backend package SHALL expose discoverable commands for running migrations, seed data, database-aware verification, and bootstrapping the first ADMIN user.

#### Scenario: Developer discovers migration script
- **WHEN** a developer inspects backend package scripts
- **THEN** a command for applying database migrations is available

#### Scenario: Developer discovers seed script
- **WHEN** a developer inspects backend package scripts
- **THEN** a command for loading development or test seed data is available

#### Scenario: Database smoke verification is available
- **WHEN** a developer inspects backend package scripts
- **THEN** a command is available to verify migrated MariaDB-backed repository behavior

#### Scenario: Developer discovers create-admin script
- **WHEN** a developer inspects backend package scripts
- **THEN** a command for creating the first ADMIN user from environment-supplied credentials is available
