## 1. Domain and Application

- [x] 1.1 Create the `alerts` backend module structure following `knowledge-base/06-engineering/backend/clean-architecture-layout.md`.
- [x] 1.2 Implement alert domain types for severity, status, risk score, reason, timestamps, cattle reference, and source event reference from `knowledge-base/02-domain/alerts.md`.
- [x] 1.3 Implement deterministic MVP risk evaluation for inactivity events, aligned with `knowledge-base/02-domain/risk-analysis.md`.
- [x] 1.4 Implement alert creation use case that creates `PENDING` alerts only when risk evaluation crosses the alert threshold.
- [x] 1.5 Implement alert listing and detail use cases with status, severity, cattle, and pagination filters from `knowledge-base/05-api/alerts.md`.
- [x] 1.6 Implement alert status update use case enforcing `PENDING -> IN_PROGRESS`, `PENDING -> ATTENDED`, and `IN_PROGRESS -> ATTENDED`.

## 2. Persistence

- [x] 2.1 Add a deterministic MariaDB migration for alerts with cattle and source activity-event relationships.
- [x] 2.2 Add indexes for alert status, severity, cattle id, created time, and source event lookup.
- [x] 2.3 Implement the MariaDB alert repository for create, find by id, list with filters, find by source event, and status update operations.
- [x] 2.4 Ensure persistence prevents duplicate generated alerts for the same source activity event.
- [x] 2.5 Update database repository verification to cover generated alert persistence and alert filtering.

## 3. API and Authorization

- [x] 3.1 Add protected `GET /api/v1/alerts` controller behavior for authorized `ADMIN`, `FIELD_OPERATOR`, and `RESEARCHER` users.
- [x] 3.2 Add protected `GET /api/v1/alerts/{id}` controller behavior with standardized not-found handling.
- [x] 3.3 Add protected `PATCH /api/v1/alerts/{id}/status` controller behavior for authorized `FIELD_OPERATOR` and `ADMIN` users.
- [x] 3.4 Validate alert query parameters, status payloads, attended timestamps, and invalid lifecycle transitions using the existing error model.
- [x] 3.5 Map alert responses to the DTO shapes documented in `knowledge-base/05-api/alerts.md`.

## 4. Activity Event Integration

- [x] 4.1 Wire accepted `INACTIVITY` events into risk evaluation and alert generation.
- [x] 4.2 Ensure accepted `ACTIVITY` events do not generate alerts by default.
- [x] 4.3 Return alert integration fields from event registration when alert generation creates a linked alert.
- [x] 4.4 Preserve idempotent retry behavior so repeated event registration does not create duplicate alerts.
- [x] 4.5 Ensure generated alerts remain traceable to the persisted source event and cattle record.

## 5. Tests

- [x] 5.1 Add unit tests for risk evaluation and severity assignment.
- [x] 5.2 Add unit tests for alert creation, threshold decisions, idempotent source-event handling, and lifecycle transitions.
- [x] 5.3 Add repository tests for alert persistence, relationships, filtering, duplicate prevention, and status updates.
- [x] 5.4 Add controller or integration tests for alert list, detail, status update, authorization, validation, and not-found responses.
- [x] 5.5 Add activity-event integration tests proving inactivity above threshold generates an alert and retries do not duplicate it.
- [x] 5.6 Run the backend test suite and relevant repository verification commands.
- [x] 5.7 Add or update backend smoke checks covering alert generation, alert APIs, and alert persistence.

## 6. Documentation and Validation

- [x] 6.1 Update local module documentation or quick references only if implementation introduces names or commands not already covered by `knowledge-base/`.
- [x] 6.2 Run `openspec validate add-alerts --strict` and fix any proposal/spec/task issues before implementation is considered ready.
- [x] 6.3 Confirm the implemented behavior remains traceable to `knowledge-base/10-roadmap/phase-6-alerts.md`, `knowledge-base/02-domain/alerts.md`, `knowledge-base/02-domain/risk-analysis.md`, and `knowledge-base/05-api/alerts.md`.
