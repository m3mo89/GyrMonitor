# Database Persistence Specification

## Purpose

Define the MariaDB configuration, migration, constraints, seed, and repository verification requirements shared by implemented backend modules.

## Requirements

### Requirement: MariaDB database configuration
The backend SHALL define database configuration required to connect to MariaDB without exposing credentials through public API responses.

#### Scenario: Database configuration is loaded
- **WHEN** the backend starts with database environment variables
- **THEN** the runtime can create a MariaDB connection using host, port, database, user, password, and connection options from configuration

#### Scenario: Missing required database configuration fails clearly
- **WHEN** a database-aware command starts without required database configuration
- **THEN** it exits with an actionable configuration error instead of silently falling back to in-memory persistence

#### Scenario: Availability endpoint omits database credentials
- **WHEN** the public availability endpoint responds
- **THEN** it does not include database URLs, usernames, passwords, or connection secrets

### Requirement: Versioned MariaDB migrations
The backend SHALL provide deterministic versioned migrations for all implemented persisted entities.

#### Scenario: Migrations create implemented tables
- **WHEN** migrations run against an empty MariaDB database
- **THEN** they create tables for users, cattle, alerts, activity events, and observations

#### Scenario: Migrations record applied versions
- **WHEN** a migration completes successfully
- **THEN** the applied migration version is recorded so the same migration is not applied again

#### Scenario: Migrations preserve schema and seed separation
- **WHEN** schema migrations are reviewed
- **THEN** they do not include development seed records unless a migration specifically requires reference data

### Requirement: MariaDB constraints and indexes
The database schema SHALL enforce the uniqueness, relationship, and query constraints required by implemented backend behavior.

#### Scenario: Unique business identifiers are enforced
- **WHEN** records are persisted
- **THEN** users have unique email values, cattle have unique tag numbers, activity events have unique event ids, and observations have unique observation ids

#### Scenario: Relational references are enforced
- **WHEN** an activity event, alert, or observation references another persisted entity
- **THEN** the database enforces the corresponding cattle, activity-event, or alert relationship

#### Scenario: Common filters are indexed
- **WHEN** migrations create queryable tables
- **THEN** they include indexes for cattle ids, event capture time, cattle status, alert status or severity where present, and observation alert ids

### Requirement: Development and test seed data
The backend SHALL provide seed support for deterministic development and test records without using real farm, user, or animal health data.

#### Scenario: Seeds insert MVP records
- **WHEN** the seed command runs after migrations
- **THEN** it creates deterministic MVP users, cattle, alerts, sample activity events, and sample observations needed by existing workflows

#### Scenario: Seeds are repeatable
- **WHEN** the seed command is run more than once
- **THEN** it does not create duplicate records for the same deterministic ids or unique business identifiers

### Requirement: Repository persistence verification
The backend SHALL provide automated checks that verify MariaDB repositories and migrations against a prepared database.

#### Scenario: Repository checks pass with prepared database
- **WHEN** the database is migrated and seeded
- **THEN** repository verification can authenticate users, list cattle, register/list events, and create/list observations using MariaDB

#### Scenario: Repository checks fail without required database
- **WHEN** repository verification runs without a reachable configured MariaDB database
- **THEN** the command exits with a failure that identifies database connectivity or configuration as the cause
