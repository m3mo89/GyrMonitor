## Why

Phase 4 needs the inspection trail that lets field operators document what they found after reviewing an alert. The knowledge base defines observations as the MVP mechanism for human context, user attribution, alert traceability, and offline-safe creation references; see `knowledge-base/10-roadmap/phase-4-observations.md`, `knowledge-base/02-domain/observations.md`, and `knowledge-base/05-api/observations.md`.

## What Changes

- Add an Observation capability for textual field observations associated with existing alerts.
- Expose protected observation creation through `POST /api/v1/alerts/{id}/observations`, aligned with `knowledge-base/05-api/observations.md`.
- Preserve operator identity, client-provided observation id, original creation timestamp, comment, alert association, and optional client id as documented in `knowledge-base/02-domain/observations.md`.
- Apply idempotency so retrying the same offline-created observation does not create duplicate backend records.
- Provide a minimal read path for alert traceability so observations can be consulted from alert context, following RF-14 in `knowledge-base/03-requirements/functional-requirements.md`.
- Keep this change scoped to backend/API and contract coverage for observations; broader mobile/desktop local models and full sync endpoint implementation remain referenced by the knowledge base but out of this review-sized change.

## Capabilities

### New Capabilities

- `observations`: Field observation registration and consultation for alert traceability.

### Modified Capabilities

- None.

## Impact

- Backend observations domain/application/infrastructure modules.
- Alert lookup integration to enforce that observations belong to existing alerts.
- Auth/role guards for `FIELD_OPERATOR` and `ADMIN` observation creation.
- API DTOs and response contracts for observation creation and alert-scoped consultation.
- Persistence schema or migration for observations with duplicate protection on client-provided observation ids.
- Automated tests for validation, authorization, alert existence, timestamp preservation, and idempotent retry behavior.
