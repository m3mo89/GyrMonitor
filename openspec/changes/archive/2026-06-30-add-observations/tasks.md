## 1. Domain and Application

- [x] 1.1 Add the Observation domain model and validation helpers for UUIDs, non-empty comments, `createdAt`, and optional `clientId`.
- [x] 1.2 Define observation repository and alert lookup interfaces used by the inspections application layer.
- [x] 1.3 Implement `AddAlertObservationUseCase` with alert existence validation, authenticated user attribution, timestamp preservation, and `observationId` idempotency.
- [x] 1.4 Implement `ListAlertObservationsUseCase` for alert-scoped traceability reads.

## 2. Infrastructure

- [x] 2.1 Add a local observation repository that stores observations by backend id and enforces uniqueness by client-provided `observationId`.
- [x] 2.2 Add the minimal local alert lookup or fixture support needed to verify existing-alert behavior without expanding the alerts module beyond this change.
- [x] 2.3 Register inspections providers in the backend module structure using the repository/use-case boundaries from `design.md`.

## 3. HTTP API

- [x] 3.1 Add observation request/response DTO mapping for `POST /api/v1/alerts/{id}/observations`.
- [x] 3.2 Add the protected observations controller route for creation with `ADMIN` and `FIELD_OPERATOR` access.
- [x] 3.3 Add the protected alert-scoped observations list route with `ADMIN`, `FIELD_OPERATOR`, and `RESEARCHER` access.
- [x] 3.4 Map validation, not-found, forbidden, unauthorized, and unexpected errors to the existing standardized API response patterns.

## 4. Verification

- [x] 4.1 Add use-case tests for successful creation, empty comment rejection, unknown alert rejection, user attribution, timestamp preservation, and idempotent retry behavior.
- [x] 4.2 Add controller or route-level checks for allowed roles, denied roles, missing token, success response shape, and alert-scoped list behavior.
- [x] 4.3 Add or update the backend phase check script so `npm test`, `npm run build`, or the repo's existing verification path covers the observations change.
- [x] 4.4 Run the relevant backend verification commands and record any remaining gaps before marking the change complete.
