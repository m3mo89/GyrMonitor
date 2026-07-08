## ADDED Requirements

### Requirement: Feature-level Clean Architecture boundaries

Implemented features in `mobile/GyrMonitor.Mobile.Core`, `desktop/GyrMonitor.Desktop.Core`, and the domain-named folders of `shared/GyrMonitor.Client.Core` SHALL separate `Domain`, `Application`, `Infrastructure`, and `Presentation` responsibilities within the owning feature folder when the feature includes local business validation, more than one persistence/API dependency composed in the same orchestration step, or a multi-step workflow (for example: load, then select, then validate, then persist, then enqueue for sync).

#### Scenario: Complex feature is promoted to layered folders

- **WHEN** a `.NET MAUI` client feature adds local business validation, composes more than one repository or API client in a single orchestration step, or implements a multi-step workflow
- **THEN** the feature is organized with explicit `Domain`, `Application`, `Infrastructure`, and `Presentation` folders inside its owning `Features/<feature>/` (or, for shared entity-agnostic sync primitives, inside `shared/GyrMonitor.Client.Core/Sync/`)

#### Scenario: Simple feature remains intentionally flat

- **WHEN** a `.NET MAUI` client feature is read-only, issues a single API call, and has no local validation or multi-step orchestration
- **THEN** the feature MAY remain flat only if it does not mix API/DTO details, entity construction, and ViewModel presentation state in a way that violates the dependency rule

### Requirement: MAUI client dependency rule

`.NET MAUI` client feature dependencies SHALL point inward: `Presentation` (ViewModels in the `*.Core` project and XAML pages/code-behind in the UI head project) may depend on `Application`; `Application` may depend on `Domain` and abstract ports (`I*Repository`, `I*Api`); `Infrastructure` implements those ports and depends on `Domain`; `Domain` code MUST NOT reference `Microsoft.Maui`, `CommunityToolkit.Mvvm`, `HttpClient`, or API DTO types. Domain entities MAY carry `sqlite-net-pcl` mapping attributes (`[Table]`, `[PrimaryKey]`, and similar declarative metadata from the `SQLite` attribute namespace) as persistence shape, since these client entities are already the persisted local-storage rows and introducing a parallel mapped class would duplicate the shape for no behavioral benefit at this project's scale; Domain code MUST NOT reference `SQLiteAsyncConnection`, `ISqliteConnectionProvider`, or any connection/query type — that behavior stays in `Infrastructure`.

#### Scenario: Domain code remains framework independent

- **WHEN** a domain entity, value object, or validation rule is added under a `.NET MAUI` client feature's `Domain` folder
- **THEN** it does not reference `Microsoft.Maui`, `CommunityToolkit.Mvvm`, `HttpClient`, or API DTO types, and does not reference `SQLiteAsyncConnection`, `ISqliteConnectionProvider`, or other SQLite connection/query types

#### Scenario: Domain entities may declare persistence mapping attributes

- **WHEN** a `Domain` entity is also the locally persisted SQLite row (for example `PendingObservation`, `PendingEvent`, `LocalAlert`, `SyncQueueItem`)
- **THEN** it may carry `sqlite-net-pcl` attributes such as `[Table]` and `[PrimaryKey]` to declare its storage shape, and this alone does not require moving the entity out of `Domain`

#### Scenario: ViewModel does not own persistence or API details

- **WHEN** a ViewModel command needs to persist data or call the backend
- **THEN** it calls an `Application`-layer use case/service rather than directly constructing SQL/SQLite repository calls and API client calls inline in the command method

#### Scenario: XAML/code-behind consumes only ViewModel-exposed members

- **WHEN** a UI head project's page (XAML or code-behind) needs feature data or actions
- **THEN** it binds to or calls members exposed by the feature's `Presentation`-layer ViewModel, and does not construct or call repository or API client types directly

### Requirement: Screaming Architecture is preserved inside MAUI client projects

`mobile/GyrMonitor.Mobile.Core`, `desktop/GyrMonitor.Desktop.Core`, and `shared/GyrMonitor.Client.Core` SHALL remain organized by business capability first, with technical layers nested inside each feature or domain-named folder, rather than moving feature code into global technical folders such as `ViewModels/`, `Repositories/`, `ApiClients/`, or `Services/` at the project root.

#### Scenario: New client feature exposes its business purpose

- **WHEN** a new mobile or desktop capability is added
- **THEN** its primary code lives under a business-named `Features/<name>/` folder in the owning `*.Core` project before being subdivided by technical layer

#### Scenario: Shared client core stays domain-named, not technical-named

- **WHEN** code is added to `shared/GyrMonitor.Client.Core`
- **THEN** it lives under an existing or new domain-named folder (such as `Authentication/`, `Alerts/`, `Sync/`) reused by both clients, not under a project-root folder named only by technical role

### Requirement: SOLID-friendly MVVM composition

`.NET MAUI` client ViewModels SHALL keep a single orchestration responsibility per command, `Application`-layer use cases/services SHALL expose narrow feature operations, and concrete `Infrastructure` adapters (API clients, SQLite repositories) SHALL be replaceable through their existing `I*Api`/`I*Repository` interfaces without ViewModel changes.

#### Scenario: ViewModel command delegates multi-step orchestration

- **WHEN** a ViewModel command performs validation, entity construction, persistence, and sync-queue enqueueing for the same user action
- **THEN** that sequencing is implemented by an `Application`-layer class the ViewModel calls, not inline across multiple private ViewModel methods

#### Scenario: Infrastructure adapter can change without ViewModel rewrite

- **WHEN** a feature's concrete repository or API client implementation changes (for example, a different local storage engine or an updated DTO shape)
- **THEN** the `Application`-layer use case and the `Presentation`-layer ViewModel continue working against the same `I*Repository`/`I*Api` interface and require no changes

### Requirement: Client domain state does not duplicate backend authority

`.NET MAUI` client `Domain` folders SHALL contain only client-local entities, value objects, and validation used for offline persistence and UX (for example: required-field checks, numeric range checks, local entity shape), and MUST NOT recompute or duplicate backend-owned values such as risk score, alert severity, or authorization decisions.

#### Scenario: Client validation stays UX-local

- **WHEN** a client `Domain` validation rule is added (for example, confidence must be between 0 and 1, or comment must not be empty)
- **THEN** it only prevents an obviously invalid local submission and does not substitute for backend-side authoritative validation

#### Scenario: Backend-computed values are not recalculated locally

- **WHEN** a `.NET MAUI` client feature displays or acts on risk score, alert severity, or authorization outcome
- **THEN** it uses the value supplied by the backend response rather than a locally recomputed equivalent in `Domain` or `Application`
