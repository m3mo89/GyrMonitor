## Context

Phase 5 introduces the backend event ingestion capability described in `knowledge-base/10-roadmap/phase-5-activity-events.md`. The domain contract lives in `knowledge-base/02-domain/activity-events.md`, API shape in `knowledge-base/05-api/activity-events.md`, DTO/enumeration details in `knowledge-base/07-reference/dto-catalog.md` and `knowledge-base/07-reference/enumerations.md`, and role access in `knowledge-base/07-reference/roles-and-permissions.md`.

The repository already has a placeholder `backend/src/activity-events/` boundary and a cattle history placeholder in the cattle-monitoring module. This change should fill the activity-events boundary and replace the cattle history placeholder with event-backed history while preserving the Clean Architecture style used by authentication, cattle management, and observations.

## Goals / Non-Goals

**Goals:**

- Add an ActivityEvent domain model for the MVP fields documented in `knowledge-base/02-domain/activity-events.md`.
- Implement `POST /api/v1/events` for authorized `ADMIN` and `SYSTEM_GENERATOR` callers.
- Implement idempotent creation by client/system `eventId`, with optional support for `Idempotency-Key` at the HTTP boundary.
- Validate event type, cattle existence, inactivity duration rules, confidence range, source, and capture timestamp according to the knowledge-base contracts.
- Implement `GET /api/v1/events` with MVP filters and pagination.
- Replace the cattle history placeholder for `GET /api/v1/cattle/{id}/events` with real event history for authorized `ADMIN` and `RESEARCHER` users.
- Keep activity-event storage and application interfaces compatible with later risk analysis, alert generation, dashboard, and offline sync phases.

**Non-Goals:**

- Implement `POST /api/v1/sync/events` or full offline sync queue processing.
- Implement complete alert generation, alert lifecycle, dashboard rollups, or cattle risk ranking.
- Build external detection pipelines, device integrations, or specialized capture infrastructure.
- Add mobile or desktop local persistence beyond keeping the API contract ready for those clients.

## Decisions

1. Implement activity events in the existing `backend/src/activity-events/` boundary.

   Rationale: the project already has a placeholder module for this phase, and the knowledge base treats Activity Events as its own domain module. Keeping the behavior there avoids mixing event ingestion into cattle-monitoring or inactivity-analysis.

   Alternative considered: add event logic directly to cattle-monitoring because cattle history is affected. That would make the first route faster but would bury event registration and idempotency inside the wrong module.

2. Use application use cases and repository interfaces.

   Rationale: the existing backend favors domain/application/http/infrastructure folders. `RegisterActivityEventUseCase`, `ListActivityEventsUseCase`, and a cattle-history query integration can be tested without depending on NestJS controllers or a future database adapter.

   Alternative considered: put persistence and validation directly in the controller. That would be smaller initially but harder to reuse for offline sync and later alert generation.

3. Treat `eventId` as the primary idempotency key and `Idempotency-Key` as an HTTP retry aid.

   Rationale: `knowledge-base/02-domain/activity-events.md`, `knowledge-base/05-api/activity-events.md`, and BR-004 in `knowledge-base/03-requirements/business-rules.md` require duplicate event IDs not to create duplicate records. The HTTP header can be accepted or forwarded for later sync consistency, but the domain-level duplicate guard should be the stable event id.

   Alternative considered: require only `Idempotency-Key`. That would diverge from the DTO catalog and make simulator/manual payloads less self-contained.

4. Return an event registration response that is ready for risk/alert integration without implementing Phase 6.

   Rationale: the API reference shows `riskScore`, `severity`, `alertGenerated`, and `alertId`, while `knowledge-base/10-roadmap/phase-6-alerts.md` owns alert generation. This phase should expose a stable response shape with event persistence confirmed and risk/alert fields populated only by any minimal deterministic hook available in this phase or left null/false until Phase 6 expands the behavior.

   Alternative considered: fully implement alerts now. That would violate the requested Phase 5 scope and duplicate the upcoming `add-alerts` change.

5. Replace, not duplicate, cattle history behavior.

   Rationale: `openspec/specs/cattle-management/spec.md` already reserves `GET /api/v1/cattle/{id}/events` as a placeholder. This change should modify that requirement so the route returns event history for existing cattle and keeps the same authorization/error semantics.

   Alternative considered: expose only `GET /events?cattleId=...` and leave cattle history untouched. That would miss FRQ-003/RF-03 and the Phase 5 event-history-by-cattle scope.

## Risks / Trade-offs

- Risk/alert API fields are ahead of the implemented alert module -> Keep the contract explicit and document placeholder/null behavior until Phase 6 owns alert creation.
- Persistence may still be local or lightweight -> Keep repository contracts narrow and enforce unique `eventId` so moving to database migrations later is mechanical.
- Duplicate `eventId` with different payload can hide producer bugs -> For this phase, return the existing event and add tests around duplicate protection; stricter idempotency conflict handling can be added with offline sync.
- Cattle history crosses module boundaries -> Use a small activity-event query dependency from cattle-monitoring rather than making cattle own event persistence.
- Simulator/manual sources may evolve -> Validate against the approved source values but avoid source-specific business rules, per `knowledge-base/02-domain/activity-events.md`.

## Migration Plan

- Add activity-events domain, application, infrastructure, HTTP, and module wiring without changing existing authentication or observations behavior.
- Add event storage with uniqueness on `eventId` and an index/query path for `cattleId` plus `capturedAt`.
- Replace the cattle history placeholder use case wiring with an event-backed query dependency.
- Add focused tests before broad integration work: use cases first, then controller/route authorization and response shape.
- Rollback is limited to unregistering the activity-events module and restoring the existing cattle history placeholder behavior if the phase is backed out.

## Open Questions

- Should a duplicate `eventId` with a different payload return the existing event or become `IDEMPOTENCY_CONFLICT` before the offline-sync phase?
- Should `confidence` remain required for manual entries, as currently documented in `knowledge-base/07-reference/dto-catalog.md`, or become optional for purely manual capture?
- Which later change will own deterministic risk calculation if it is not included in this phase: an inactivity-analysis change or the Phase 6 alerts change?
