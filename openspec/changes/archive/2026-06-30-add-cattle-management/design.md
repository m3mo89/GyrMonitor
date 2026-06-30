## Context

GyrMonitor has Phase 1 foundation and Phase 2 authentication available, and Phase 3 needs cattle records as reference data for later activity events, alerts, observations, and dashboard metrics. The source of truth is `knowledge-base/`, especially:

- `knowledge-base/10-roadmap/phase-3-cattle-management.md`
- `knowledge-base/02-domain/cattle.md`
- `knowledge-base/05-api/cattle.md`
- `knowledge-base/03-requirements/functional-requirements.md`
- `knowledge-base/03-requirements/business-rules.md`
- `knowledge-base/07-reference/roles-and-permissions.md`
- `knowledge-base/06-engineering/backend/modules.md`
- `knowledge-base/06-engineering/backend/repositories.md`
- `knowledge-base/06-engineering/frontend/feature-organization.md`

The repository already has `backend/src/cattle-monitoring` and `frontend/src/features/cattle` placeholders. This change should turn those placeholders into the minimal read-oriented cattle capability required by the MVP.

## Goals / Non-Goals

**Goals:**

- Implement a backend `cattle-monitoring` capability with a cattle model, repository port/adapter, list use case, detail use case, and MVP seed records.
- Expose protected cattle list and detail endpoints using the existing authentication and role guard foundation.
- Reserve the documented cattle history route shape so activity-event history can be attached in a later phase without changing cattle navigation.
- Implement frontend cattle list and detail pages under the existing `features/cattle` boundary with loading, empty, error, and not-found states.
- Keep cattle fields aligned with the Knowledge Base so later modules can reference cattle by UUID and display tag/status/risk data.

**Non-Goals:**

- Implement manual cattle creation, update, delete, veterinary history, reproductive history, feeding records, production metrics, photos, corral/location management, or external livestock integrations.
- Implement real event, alert, or observation history. The history endpoint/page section remains an explicit placeholder until later phases.
- Rework authentication, global routing, dashboard, alerts, events, offline sync, or database architecture beyond the smallest integration points needed for cattle.

## Decisions

1. Keep cattle in the `cattle-monitoring` backend module.

   The Knowledge Base names `cattle-monitoring` as the owner of cattle registration, listing, and history. Use cases and repository interfaces should live inside that capability boundary; shared code should remain limited to framework-neutral primitives.

   Alternative considered: add cattle as a generic shared reference-data module. This was rejected because cattle is the central domain subject and will own future cattle history integration.

2. Implement read-oriented endpoints first.

   Phase 3 acceptance requires listing and consulting cattle, while the functional requirements note that creation may be seeded or future administrative capability. The MVP implementation should support seeded records and read APIs now, leaving write workflows for a later change.

   Alternative considered: include `POST /cattle` immediately. This was deferred to keep the change small enough to review and aligned with the current API contract emphasis.

3. Use repository ports for cattle persistence.

   `ICattleRepository` should hide ORM/SQL details from list and detail use cases. The implementation can use the current persistence approach from the foundation, but use cases should consume application/domain models rather than ORM entities.

   Alternative considered: query persistence directly from controllers. This was rejected because later events, alerts, and dashboard modules need stable cattle lookup behavior.

4. Treat cattle history as a contract placeholder.

   `GET /api/v1/cattle/{id}/events` should be routed and protected, but it should clearly return an empty/paginated placeholder or documented not-yet-populated response until activity events exist. The frontend detail page can reserve a history area without inventing event data.

   Alternative considered: skip the route until activity events. This was rejected because the Phase 3 roadmap explicitly calls for a history contract placeholder.

5. Let backend authorization remain authoritative.

   Cattle read access should allow `ADMIN` and `RESEARCHER` as documented. Frontend route guards may improve navigation, but backend guards decide access.

   Alternative considered: frontend-only role checks for early MVP screens. This was rejected because the API must already be safe for later clients.

## Risks / Trade-offs

- [Risk] Seeded cattle data may be mistaken for a complete cattle administration workflow. -> Mitigation: keep proposal/spec/tasks explicit that manual create/update/delete is out of scope.
- [Risk] The history placeholder may look like completed event history. -> Mitigation: name the response state clearly and avoid fake event/alert/observation data.
- [Risk] Cattle fields needed by later modules may drift from the Knowledge Base. -> Mitigation: reference `knowledge-base/02-domain/cattle.md` and `knowledge-base/05-api/cattle.md` in tests and implementation notes.
- [Risk] Adding persistence now can create migration friction. -> Mitigation: keep the schema limited to MVP cattle fields and seed data, with no future-only livestock metadata.

## Migration Plan

Add the cattle persistence shape and MVP seed records through the repository's existing migration/seed mechanism. Deploy backend changes before or with the frontend so the cattle routes are available when the UI is exposed.

Rollback consists of removing the cattle module implementation, seed data, frontend cattle routes/pages, and related tests. No user-generated cattle data is expected because manual cattle writes are out of scope.

## Open Questions

- Should the history placeholder return `200` with an empty collection or a standardized not-implemented-style response until activity events are added?
- Which exact seed cattle records should be used for MVP demos beyond satisfying the minimum field coverage?
