## Why

The frontend already follows the outer `app/`, `features/`, and `shared/` shape, but feature internals still mix presentation, remote data access, query orchestration, form state, validation, and feature types in flat folders. That makes the code partially aligned with Screaming Architecture, but not yet with the project's Clean Architecture dependency rule, SOLID boundaries, or the approved "group by feature first, then by technical layer inside the feature" guidance.

This matters now because the web app is growing beyond read-only MVP screens: admin user management has mutations, form validation, route authorization, and backend integration in one page-level feature folder, so future features will compound the same coupling unless the frontend architecture contract is made explicit before more screens are added.

## What Changes

- Define explicit frontend Clean Architecture requirements for each implemented feature: `domain`, `application`, `infrastructure`, and `presentation` responsibilities must be separated when a feature has meaningful business behavior, mutations, or more than one screen.
- Require feature dependencies to point inward: presentation may call application hooks/use-cases; application may depend on domain types/rules and abstract ports; infrastructure implements API/browser adapters; domain must not import React, TanStack Query, router APIs, browser storage, or HTTP clients.
- Keep Screaming Architecture as the top-level organizing principle: business capabilities such as `auth`, `dashboard`, `cattle`, `alerts`, and `user-management` remain under `features/`, with technical folders nested inside the feature rather than grouped globally by file type.
- Add a pragmatic migration rule: simple read-only or placeholder features may stay flat temporarily, but any feature with mutations, local business validation, route-specific orchestration, or multiple UI surfaces must be promoted to layered folders before new behavior is added.
- Capture SOLID-oriented guardrails for the frontend: page components should not own API details or business rules; application hooks/use-cases should expose small interfaces; infrastructure clients should be replaceable behind ports; shared code is promoted only when reused or truly cross-cutting.
- Plan an implementation audit and refactor path for the current frontend without changing user-facing behavior: start with `user-management`, then apply the same pattern to `auth`, `alerts`, `cattle`, and `dashboard` as their complexity warrants.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `web-frontend-architecture`: Add requirements for feature-level Clean Architecture layering, inward-only dependencies, SOLID-friendly boundaries, and Screaming Architecture compliance beyond the current top-level folder layout.

## Impact

- **Affected planning/specs**: `openspec/specs/web-frontend-architecture/spec.md` through a delta spec in this change.
- **Affected code when implemented later**: `frontend/src/features/*`, especially `frontend/src/features/user-management/`, plus imports from `frontend/src/app/router/` and existing shared utilities/hooks as needed.
- **APIs**: No backend API contract changes.
- **Dependencies**: No new npm dependencies expected.
- **Systems**: Web frontend only. Backend, mobile, desktop, database, and deployment runtime behavior remain out of scope.
- **Risk**: Medium-low. The change is structural and should preserve behavior, but moving feature files and tightening dependency boundaries can break imports or tests if not migrated incrementally.
