# Project Foundation Specification

## Purpose

Define the baseline repository, application skeleton, database, configuration, and verification requirements that prepare GyrMonitor for later business-module implementation.

## Requirements

### Requirement: Repository foundation structure

The repository SHALL provide top-level foundation areas for backend, frontend, mobile, desktop, database, documentation, OpenSpec changes, and agent configuration consistent with the approved Knowledge Base.

#### Scenario: Foundation folders are present

- **WHEN** a developer inspects the repository after the foundation change
- **THEN** the expected top-level source areas for backend, frontend, mobile, desktop, and database-related work are present or explicitly documented as planned foundation locations

#### Scenario: Documentation links remain valid

- **WHEN** a developer follows the foundation documentation references
- **THEN** links to the knowledge base, engineering guidance, reference directory map, and OpenSpec workflow resolve to existing files

### Requirement: Backend skeleton

The backend foundation SHALL provide a minimal NestJS-oriented TypeScript application skeleton with Clean Architecture-oriented module boundaries and no implemented business logic.

#### Scenario: Backend skeleton validates

- **WHEN** the backend verification command is run
- **THEN** the command completes successfully for the skeleton application

#### Scenario: Backend contains no domain behavior

- **WHEN** the backend scaffold is reviewed
- **THEN** it contains no implemented authentication, cattle management, activity event, alert, dashboard, risk analysis, or offline synchronization business rules

### Requirement: Frontend skeleton

The frontend foundation SHALL provide a minimal React + TypeScript application skeleton organized for feature-based development and typed API consumption.

#### Scenario: Frontend skeleton validates

- **WHEN** the frontend verification command is run
- **THEN** the command completes successfully for the skeleton application

#### Scenario: Frontend contains no feature workflow

- **WHEN** the frontend scaffold is reviewed
- **THEN** it contains no completed authentication, dashboard, cattle, event, alert, metrics, or synchronization workflow

### Requirement: Mobile and desktop skeletons

The foundation SHALL provide .NET MAUI-oriented mobile and desktop project structures, placeholders, or documented setup paths with shared boundaries for navigation, networking, local storage, and future synchronization work.

#### Scenario: Client skeletons validate

- **WHEN** the mobile and desktop verification commands or setup notes are reviewed
- **THEN** they either complete successfully for generated skeletons or document the exact SDK prerequisite and setup path needed to run them

#### Scenario: Client skeletons preserve offline boundary

- **WHEN** the mobile and desktop scaffolds are reviewed
- **THEN** local persistence and synchronization boundaries exist without implementing authoritative risk calculation or completed offline workflows

### Requirement: Database foundation

The foundation SHALL provide central MariaDB and local SQLite structure for future migrations, local storage, and seed strategy without introducing production data.

#### Scenario: Database structure is prepared

- **WHEN** a developer inspects the database foundation
- **THEN** there are clear locations for central database migrations, local SQLite schema work, and seed strategy artifacts

#### Scenario: No production seed data is committed

- **WHEN** seed-related files are reviewed
- **THEN** they contain only safe examples, placeholders, or documentation and no production secrets or real operational data

### Requirement: Environment configuration baseline

The foundation SHALL provide non-secret configuration examples and validation entry points for each runtime using the approved configuration reference.

#### Scenario: Environment examples are available

- **WHEN** a developer prepares a local environment
- **THEN** each scaffolded runtime provides or references example configuration keys needed for local development

#### Scenario: Secrets are excluded

- **WHEN** configuration files are reviewed
- **THEN** no production secrets, private credentials, or real tokens are committed

### Requirement: Quality command baseline

The foundation SHALL expose repeatable commands or documented placeholders for building, linting, formatting, testing, and CI/test verification of the scaffolded project areas.

#### Scenario: Verification commands are discoverable

- **WHEN** a developer reads the repository setup or project metadata
- **THEN** the available build, lint, format, test, and CI/test placeholder commands for scaffolded areas are discoverable

#### Scenario: Foundation verification succeeds

- **WHEN** the foundation verification workflow is executed in a prepared development environment
- **THEN** the scaffolded project areas pass their baseline checks without requiring domain feature implementation
