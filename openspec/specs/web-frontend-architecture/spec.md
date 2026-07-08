# Web Frontend Architecture Specification

## Purpose

Define the structural and architectural conventions for the web frontend: declarative routing with a shared access-control guard, a consistent remote data-fetching pattern, a shared layer for cross-cutting code, and a policy against orphaned placeholder folders.

## Requirements

### Requirement: Declarative routing
The web frontend SHALL define all routes declaratively (via a routing library configuration) rather than through hand-rolled URL path matching embedded in view components, and SHALL apply role-based access control through a single reusable guard rather than inline per-route authorization checks.

#### Scenario: Adding a new route requires no view-component edits
- **WHEN** a developer adds a new page and route
- **THEN** the route is registered in the routing configuration without modifying unrelated existing route branches or duplicating role-check logic inline in the composition root

#### Scenario: Protected route enforces role access consistently
- **WHEN** a user without a required role navigates to a protected route
- **THEN** the shared route guard blocks or redirects access using the same mechanism used by every other protected route

### Requirement: Consistent remote data-fetching pattern
All frontend features that fetch remote server data SHALL use the project's shared query mechanism (TanStack Query, per ADR-004) rather than ad hoc `useEffect`/`useState` fetch orchestration duplicated per page.

#### Scenario: Feature page fetches list or detail data
- **WHEN** a feature page needs to load data from the backend API
- **THEN** it uses a shared query hook built on TanStack Query, and does not implement its own loading/error/race-condition-guard logic independently of that mechanism

### Requirement: Shared cross-cutting code lives in shared layer
Types and utility functions used by more than one feature SHALL be defined once in the `shared/` layer and imported by consuming features, rather than duplicated per feature module.

#### Scenario: Multiple features need the same response envelope type
- **WHEN** two or more feature API modules need to describe the same backend response shape
- **THEN** that type is defined once under `shared/types` and imported, not redefined per feature

#### Scenario: Multiple features need the same formatting utility
- **WHEN** two or more feature components need the same data-formatting logic (e.g., date/time formatting)
- **THEN** that logic is defined once under `shared/utils` and imported, not duplicated per feature

### Requirement: No orphaned placeholder folders
Every top-level folder under `app/`, `features/`, and `shared/` SHALL either contain real implementation or carry documentation that accurately states its status and links to a tracked roadmap item or technical-debt entry justifying why it remains unimplemented. Folders SHALL NOT retain generic "Phase 1" scaffold text once their contents are implemented.

#### Scenario: Empty feature folder is deliberate
- **WHEN** a `features/<name>` folder contains no implementation
- **THEN** its `README.md` explains that the feature is not yet scheduled or is planned for a specific roadmap phase, and does not claim implementation status that contradicts the folder's actual contents

#### Scenario: Implemented folder documentation matches reality
- **WHEN** a folder under `app/`, `features/`, or `shared/` contains working implementation
- **THEN** its `README.md` (if present) describes what is actually implemented rather than stating it is a placeholder for future work

### Requirement: Deployed API base URL configuration
The web frontend SHALL document and verify the API base URL used by local, staging, and production builds.

#### Scenario: Local frontend targets local backend
- **WHEN** the frontend runs in development
- **THEN** its API base URL points to a local backend API root

#### Scenario: Staging frontend targets staging backend
- **WHEN** the frontend is built for staging
- **THEN** its configured API base URL points to `https://gyrmonitor-staging.up.railway.app/api/v1`

#### Scenario: Production frontend targets production backend
- **WHEN** the frontend is built for production
- **THEN** its configured API base URL points to `https://gyrmonitor-production.up.railway.app/api/v1` and does not reuse local or staging values

#### Scenario: Build-time configuration is documented
- **WHEN** a developer or operator configures Vercel environment variables
- **THEN** project documentation states that `VITE_API_BASE_URL` is evaluated at build time and requires a redeploy after changes

#### Scenario: Local fallback is not mistaken for deployed environment
- **WHEN** a deployed frontend uses the local development fallback API URL
- **THEN** documentation or verification identifies that as an environment misconfiguration

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
