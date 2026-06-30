## Why

Phase 5 needs the structured activity-event ingestion path that feeds later risk analysis, alerts, dashboard metrics, cattle history, and offline synchronization. The knowledge base defines this scope in `knowledge-base/10-roadmap/phase-5-activity-events.md`, with domain and API details in `knowledge-base/02-domain/activity-events.md` and `knowledge-base/05-api/activity-events.md`.

## What Changes

- Add an Activity Events capability for registering activity and inactivity records associated with existing cattle.
- Expose protected event registration through `POST /api/v1/events`, aligned with `knowledge-base/05-api/activity-events.md`.
- Persist the event fields documented in `knowledge-base/02-domain/activity-events.md`, including client/system `eventId`, `cattleId`, `eventType`, optional inactivity duration, confidence, capture timestamp, source, and backend creation timestamp.
- Apply idempotency so duplicate event IDs and retry-safe requests do not create duplicate records, following `knowledge-base/03-requirements/business-rules.md`.
- Expose event consultation through `GET /api/v1/events` and cattle event history through `GET /api/v1/cattle/{id}/events`.
- Keep this change scoped to MVP structured manual/simulator/controlled-test events; external detection pipelines, full alert generation, dashboard rollups, and offline sync batch endpoints remain later phases.

## Capabilities

### New Capabilities
- `activity-events`: Event registration, idempotency, listing, and cattle-scoped event history for MVP activity and inactivity records.

### Modified Capabilities
- `cattle-management`: Replace the cattle history placeholder with real activity-event history for `GET /api/v1/cattle/{id}/events`.

## Impact

- Backend activity-events domain/application/infrastructure module.
- Cattle lookup integration to enforce existing-cattle association.
- Auth/role guards for `ADMIN`, `RESEARCHER`, and `SYSTEM_GENERATOR` access as documented in `knowledge-base/07-reference/roles-and-permissions.md`.
- API DTOs and response contracts from `knowledge-base/07-reference/dto-catalog.md` and `knowledge-base/05-api/activity-events.md`.
- Persistence schema or local repository support with uniqueness on client/system `eventId`.
- Cattle history behavior previously reserved by `openspec/specs/cattle-management/spec.md`.
- Automated tests for validation, authorization, existing-cattle checks, captured-time preservation, idempotency, listing filters, and cattle history.
