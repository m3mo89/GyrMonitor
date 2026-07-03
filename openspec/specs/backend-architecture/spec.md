# Backend Architecture Specification

## Purpose

Define internal, non-user-facing engineering requirements for the backend's module structure: a shared kernel for cross-cutting primitives, a single HTTP error-mapping mechanism, no circular dependencies between business-capability modules, and one consistent dependency-injection strategy. These requirements do not describe HTTP-visible behavior — see the per-capability specs (`cattle-management`, `alerts`, `dashboard`, etc.) for that.

## Requirements

### Requirement: Shared kernel for cross-cutting primitives
The backend SHALL provide a shared module (`backend/src/shared`) that owns generic, domain-agnostic primitives used by more than one business-capability module, instead of those primitives living inside an unrelated module's domain layer.

#### Scenario: Generic validators live in the shared module
- **WHEN** a validator has no logic specific to any single business capability (e.g. UUID format checking, ISO-8601 datetime checking)
- **THEN** it is defined under `backend/src/shared` and imported by any module that needs it

#### Scenario: Shared HTTP response types live in the shared module
- **WHEN** a controller needs a success or error response envelope type
- **THEN** it imports that type from `backend/src/shared` instead of redeclaring it locally

### Requirement: Single HTTP error-mapping mechanism
The backend SHALL map domain errors to HTTP responses through exactly one mechanism shared across all controllers, instead of each controller implementing its own error-to-HTTP mapping function.

#### Scenario: Controllers do not redefine error mapping
- **WHEN** a controller's use case throws a known domain error
- **THEN** the HTTP status code and error envelope are produced by the shared error-mapping mechanism, not by a controller-local `toHttpError` function

#### Scenario: New domain error types are mapped in one place
- **WHEN** a new domain error type needs an HTTP mapping
- **THEN** the mapping is added to the shared mechanism's lookup, and every controller benefits without individual changes

### Requirement: No circular dependency between business-capability modules
The backend SHALL NOT have circular import dependencies between business-capability modules at any layer.

#### Scenario: Module dependency graph is acyclic
- **WHEN** the dependency graph between business-capability modules (`cattle-monitoring`, `activity-events`, `alerts`, `dashboard`, `offline-sync`, `inspections`, `inactivity-analysis`, `authentication`) is traced through their imports
- **THEN** no module directly or transitively depends on itself

### Requirement: Consistent cross-module dependency injection
The backend SHALL use NestJS's own dependency-injection container (module `imports`/`exports` and constructor injection) for a module to obtain a dependency owned by another module, instead of importing another module's internal singleton file directly.

#### Scenario: Cross-module dependency obtained via Nest module system
- **WHEN** a module needs a repository, service, or use case that another module owns
- **THEN** the owning module exports it through its `@Module` `exports` array and the consuming module declares it in its `@Module` `imports` array

#### Scenario: A module's own internal wiring is unaffected
- **WHEN** a module constructs its own repository or use case for exclusively internal use
- **THEN** this requirement does not require changing that internal construction
