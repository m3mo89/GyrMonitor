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
