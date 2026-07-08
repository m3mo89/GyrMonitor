## ADDED Requirements

### Requirement: Feature-level Clean Architecture boundaries
Implemented frontend features with meaningful behavior SHALL separate domain, application, infrastructure, and presentation responsibilities within the owning feature when the feature includes mutations, client-side business validation, multiple pages, route-level orchestration, browser/storage adapters, or feature-specific calculations.

#### Scenario: Complex feature is promoted to layered folders
- **WHEN** a frontend feature adds mutations, client-side business validation, multiple pages, route-level orchestration, browser/storage adapters, or feature-specific calculations
- **THEN** the feature is organized with explicit domain, application, infrastructure, and presentation responsibilities inside `frontend/src/features/<feature>/`

#### Scenario: Simple feature remains intentionally flat
- **WHEN** a frontend feature is read-only, has a single UI surface, and only delegates remote state through an existing shared query pattern
- **THEN** the feature MAY remain flat only if it does not mix API endpoint details, reusable business language, and UI rendering in a way that violates the dependency rule

### Requirement: Frontend dependency rule
Frontend feature dependencies SHALL point inward: presentation code may depend on application and domain code, application code may depend on domain code and abstract ports, infrastructure code may implement ports and depend on shared services, and domain code MUST NOT import React, router APIs, TanStack Query, browser storage, HTTP clients, or framework-specific modules.

#### Scenario: Domain code remains framework independent
- **WHEN** a domain type, rule, parser, or validation helper is added under a frontend feature
- **THEN** it does not import React, `react-router-dom`, `@tanstack/react-query`, browser storage APIs, or the shared HTTP client

#### Scenario: API details stay outside presentation
- **WHEN** a page or view component needs backend data
- **THEN** it obtains data or actions through feature application hooks/use-cases rather than importing endpoint paths, API clients, or infrastructure adapter functions directly

### Requirement: Screaming Architecture is preserved inside the frontend
The frontend SHALL remain organized by business capability first, with technical layers nested inside each feature, rather than moving feature code into global technical folders such as global `pages`, `components`, `hooks`, `api`, or `services`.

#### Scenario: New feature exposes its business purpose
- **WHEN** a new frontend capability is added
- **THEN** its primary code lives under a business-named folder in `frontend/src/features/` before being subdivided by technical layer

#### Scenario: Shared code is genuinely cross-cutting
- **WHEN** code is moved to `frontend/src/shared/`
- **THEN** it is reused by multiple features or represents app-wide infrastructure, and it does not contain feature-specific business behavior

### Requirement: SOLID-friendly frontend composition
Frontend page components SHALL keep a single UI composition responsibility, feature application hooks SHALL expose narrow feature operations, and concrete infrastructure adapters SHALL be replaceable without requiring page-component changes.

#### Scenario: Page does not own feature orchestration
- **WHEN** a page renders a form, table, or detail view for a feature with mutations
- **THEN** mutation orchestration, query invalidation, API mapping, and reusable validation live outside the page component in the appropriate feature layer

#### Scenario: Infrastructure adapter can change without UI rewrite
- **WHEN** a feature API implementation changes from one backend endpoint shape or adapter to another
- **THEN** presentation components continue consuming the same application-facing operation names and do not require endpoint-specific changes
