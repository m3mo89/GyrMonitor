## 1. Domain and Application

- [x] 1.1 Add the ActivityEvent domain model, enums/types, and validation helpers for UUIDs, event type, source, confidence, `inactiveMinutes`, and `capturedAt`.
- [x] 1.2 Define activity-event repository and cattle lookup/query interfaces used by the application layer.
- [x] 1.3 Implement `RegisterActivityEventUseCase` with cattle existence validation, timestamp preservation, event validation, and `eventId` idempotency.
- [x] 1.4 Implement `ListActivityEventsUseCase` with pagination and filters for cattle, event type, and captured-at date range.
- [x] 1.5 Add a cattle-scoped activity-event history query that can replace the cattle history placeholder without making cattle-monitoring own event persistence.

## 2. Infrastructure

- [x] 2.1 Add a local activity-event repository that stores events by backend id and enforces uniqueness by client/system `eventId`.
- [x] 2.2 Add query support for listing events by `cattleId`, `eventType`, `from`, `to`, page, and page size.
- [x] 2.3 Wire activity-events providers into a new backend module using the repository/use-case boundaries from `design.md`.
- [x] 2.4 Reuse or adapt the existing cattle repository lookup so event registration rejects unknown cattle ids.

## 3. HTTP API

- [x] 3.1 Add request/response DTO mapping for `POST /api/v1/events` using `knowledge-base/07-reference/dto-catalog.md`.
- [x] 3.2 Add the protected activity-events controller route for registration with `ADMIN` and `SYSTEM_GENERATOR` access.
- [x] 3.3 Add optional `Idempotency-Key` handling at the HTTP boundary without replacing `eventId` duplicate protection.
- [x] 3.4 Add the protected `GET /api/v1/events` route with `ADMIN` and `RESEARCHER` access plus documented query filters.
- [x] 3.5 Map validation, not-found, forbidden, unauthorized, and unexpected errors to the existing standardized API response patterns.

## 4. Cattle History Integration

- [x] 4.1 Replace `GetCattleHistoryUseCase` placeholder behavior with event-backed history for existing cattle.
- [x] 4.2 Keep cattle history authorization and not-found/validation behavior aligned with the existing cattle-management contract.
- [x] 4.3 Ensure cattle history returns empty event lists for existing cattle with no events and removes the placeholder marker.
- [x] 4.4 Add deterministic event ordering by `capturedAt` for cattle history responses.

## 5. Verification

- [x] 5.1 Add use-case tests for successful registration, unknown cattle rejection, invalid payloads, timestamp preservation, and duplicate `eventId` retries.
- [x] 5.2 Add listing tests for pagination, cattle filtering, event-type filtering, and captured-at date range filtering.
- [x] 5.3 Add controller or route-level checks for allowed roles, denied roles, missing token, success response shape, and standardized errors.
- [x] 5.4 Add cattle history tests for event-backed responses, empty history, ordering, and unknown cattle handling.
- [x] 5.5 Run the relevant backend verification commands and record any remaining gaps before marking the change complete.
