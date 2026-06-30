## Why

GyrMonitor needs the Phase 3 cattle reference foundation before events, alerts, observations, and dashboard metrics can reliably point to monitored animals. This change implements the small cattle-management baseline described by `knowledge-base/10-roadmap/phase-3-cattle-management.md` while keeping the Knowledge Base as the source of truth for detailed requirements.

## What Changes

- Add backend cattle capability for the cattle entity, repository access, list query, detail query, and seed data needed for MVP testing.
- Add protected `GET /api/v1/cattle` and `GET /api/v1/cattle/{id}` endpoints aligned with `knowledge-base/05-api/cattle.md`.
- Add a cattle history contract placeholder for `GET /api/v1/cattle/{id}/events` so later activity-event work can attach real history without changing the cattle route shape.
- Add web cattle list and detail views aligned with Phase 3 scope and the frontend architecture guidance.
- Enforce cattle identity and reference behavior needed by later modules: stable UUIDs, unique human-readable tag numbers, Gyr default breed, allowed sex/status values, and role-based read access.
- Add focused tests and verification coverage for cattle listing, detail lookup, not-found behavior, role protection, seeded data, and frontend list/detail rendering.
- Exclude full veterinary history, reproductive records, feeding records, production metrics, cattle photo management, location/corral association, external livestock integrations, and manual cattle creation UI/API beyond seed/support infrastructure.

## Capabilities

### New Capabilities

- `cattle-management`: Cattle reference records, protected cattle list/detail access, cattle history route placeholder, MVP seed data, and web cattle list/detail workflows.

### Modified Capabilities

None.

## Impact

- Affects backend cattle module boundaries, persistence/migration or ORM mapping, repository abstractions, protected cattle routes, seed data, and backend tests.
- Affects frontend cattle feature boundaries, protected route registration, API client/query hooks, list/detail UI states, and frontend tests.
- Depends on the authentication and role guard behavior already established by the archived `add-authentication` change.
- References detailed behavior in `knowledge-base/10-roadmap/phase-3-cattle-management.md`, `knowledge-base/02-domain/cattle.md`, `knowledge-base/05-api/cattle.md`, `knowledge-base/03-requirements/functional-requirements.md`, `knowledge-base/03-requirements/business-rules.md`, and `knowledge-base/07-reference/roles-and-permissions.md` instead of duplicating those requirements here.
