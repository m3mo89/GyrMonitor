## Context

Phase 4 introduces observations as the MVP inspection record for alert follow-up. The knowledge base is the source of truth for scope and contracts: `knowledge-base/10-roadmap/phase-4-observations.md`, `knowledge-base/02-domain/observations.md`, `knowledge-base/02-domain/inspections.md`, `knowledge-base/05-api/observations.md`, and `knowledge-base/07-reference/roles-and-permissions.md`.

The current backend uses NestJS-style modules with Clean Architecture boundaries and local repositories for implemented MVP data. There is an `inspections` placeholder module and an `alerts` placeholder module, but no full alert implementation or database-backed persistence yet. This change should therefore add observation behavior behind clear application/repository interfaces while keeping implementation small and compatible with later persistence and sync work.

## Goals / Non-Goals

**Goals:**

- Add the Observation domain model and validation rules from `knowledge-base/02-domain/observations.md`.
- Add alert-scoped observation creation for `POST /api/v1/alerts/{id}/observations` from `knowledge-base/05-api/observations.md`.
- Preserve `observationId`, `alertId`, authenticated `userId`, `comment`, original `createdAt`, and optional `clientId`.
- Make repeated requests with the same client-provided `observationId` idempotent.
- Add a minimal alert-scoped consultation path so RF-14 can be verified without building broader cattle history or dashboard integrations.
- Enforce role access using existing JWT and role guards.

**Non-Goals:**

- Implement full offline sync endpoints such as `POST /sync/observations`.
- Build mobile or desktop local observation storage.
- Add attachments, photos, checklists, veterinary diagnosis, or inspection assignment.
- Implement dashboard rollups or full cattle history enrichment.
- Replace the current local repository approach with a database integration outside this review-sized change.

## Decisions

1. Implement observations under the existing inspections boundary.

   Rationale: `knowledge-base/02-domain/inspections.md` defines MVP inspections mainly through alert status changes and observations, and the repository already has `backend/src/inspections/`. Keeping observations there avoids introducing a broader module split before alerts and inspections are fully built out.

   Alternative considered: create a top-level `observations` backend module. That is clearer if observations later grow into a large feature, but it is more surface area for this phase and duplicates the current domain grouping.

2. Use application services with repository interfaces.

   Rationale: `knowledge-base/06-engineering/backend/clean-architecture-layout.md` expects use cases to depend on interfaces rather than framework or storage details. `AddAlertObservationUseCase` and `ListAlertObservationsUseCase` can be tested with fake repositories and later backed by a database without changing HTTP behavior.

   Alternative considered: put all logic in the controller. That would be faster but would make idempotency, validation, and future sync integration harder to test.

3. Treat `observationId` as the idempotency key.

   Rationale: `knowledge-base/02-domain/observations.md` documents `observationId` as the client-provided idempotency identifier and OBS-BR-005 requires duplicate observation IDs not to create duplicate backend records. The use case should return the existing observation when the same `observationId` is submitted again.

   Alternative considered: use an HTTP idempotency header. The API document recommends idempotency for offline clients, but the documented request body already includes `observationId`, so using it keeps the MVP contract explicit.

4. Validate alert existence through a narrow alert lookup dependency.

   Rationale: OBS-BR-001 requires observations to link to an existing alert. Since the alerts module is currently a placeholder, the observations use case should depend on an `AlertLookup`/repository abstraction with minimal seeded or local data support during this phase.

   Alternative considered: accept any UUID as an alert id. That would make the endpoint easier to stub but would violate the domain rule and weaken traceability tests.

## Risks / Trade-offs

- Alert data is still immature -> Keep alert integration behind a small lookup interface and seed only the alert records needed for tests.
- Local repository persistence is temporary -> Keep DTOs, domain objects, and repository contracts aligned with the knowledge-base fields so database migration is mechanical later.
- Idempotent replay with changed payload can hide client bugs -> Return the existing observation for a duplicate `observationId` and add tests documenting this behavior; stricter conflict handling can be added with the sync phase.
- Consultation route is not fully documented in the API reference -> Keep it minimal and alert-scoped to satisfy RF-14 traceability, then extend when alert detail/cattle history specs mature.

## Migration Plan

- Add observation module files and local repository without changing existing cattle or authentication behavior.
- Register the inspections module in the application module only after its providers/controllers are ready.
- Add focused verification scripts/tests for observation use cases and API route behavior.
- Rollback is limited to removing the new inspections observation files and module registration if needed.

## Open Questions

- Should duplicate `observationId` with a different `alertId` or comment remain idempotent or become a conflict in a later sync-specific change?
- Which future change will own `POST /sync/observations`: offline sync or observations phase extension?
