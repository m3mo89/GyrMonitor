## Why

The MVP needs backend alert generation and lifecycle management so inactivity events can become actionable field-work priorities. This change implements the Alerts phase described in `knowledge-base/10-roadmap/phase-6-alerts.md`, with detailed domain and API behavior delegated to `knowledge-base/02-domain/alerts.md`, `knowledge-base/02-domain/risk-analysis.md`, and `knowledge-base/05-api/alerts.md`.

## What Changes

- Add the Alerts capability for alert domain records, severity, risk score, status lifecycle, and traceability to cattle and source activity events.
- Add deterministic risk-threshold evaluation for accepted inactivity events so backend rules can decide whether to create an alert.
- Add protected alert consultation APIs for listing and detail lookup, aligned with `knowledge-base/05-api/alerts.md`.
- Add protected alert status updates for authorized roles, including `attendedAt` handling when an alert becomes attended.
- Persist alerts in MariaDB and preserve relationships to cattle and activity events for later observations, dashboard, mobile, and sync work.
- Keep notification delivery, escalation rules, deduplication windows, assignment, and SLA analysis out of this MVP change unless explicitly required later by the knowledge base.

## Capabilities

### New Capabilities

- `alerts`: Alert generation, consultation, lifecycle status updates, persistence, and traceability as specified by the Alerts knowledge-base documents.

### Modified Capabilities

- `activity-events`: Accepted inactivity events must invoke the alert/risk evaluation boundary and return alert integration fields when an alert is generated.

## Impact

- Backend modules: new alerts domain/application/infrastructure/API module, plus integration from activity-event registration.
- Database: new alerts persistence model with foreign keys to cattle and source activity events.
- API: `GET /api/v1/alerts`, `GET /api/v1/alerts/{id}`, and `PATCH /api/v1/alerts/{id}/status` under existing authentication and role-guard conventions.
- Tests: focused unit, repository, controller, and integration tests for generation, filtering, authorization, status transitions, persistence, and traceability.
- Future consumers: dashboard, observations, mobile/offline sync, and inspections will consume the alert contract but are not implemented by this change.
