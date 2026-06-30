## 1. Backend Cattle Model and Persistence

- [x] 1.1 Inspect the existing `backend/src/cattle-monitoring` placeholder and current persistence/seed patterns from the project foundation.
- [x] 1.2 Add the cattle domain/application model with MVP fields aligned to `knowledge-base/02-domain/cattle.md`.
- [x] 1.3 Add the `ICattleRepository` port for list, detail lookup by UUID, and existence checks needed by the history placeholder.
- [x] 1.4 Add the persistence mapping, migration/schema update, or in-memory/test adapter required by the current backend foundation.
- [x] 1.5 Add MVP cattle seed data with stable UUIDs, unique tag numbers, allowed sex/status values, and default `Gyr` breed.

## 2. Backend Use Cases and API

- [x] 2.1 Implement the cattle list use case with pagination metadata and summary fields aligned to `knowledge-base/05-api/cattle.md`.
- [x] 2.2 Implement the cattle detail use case with standardized not-found and validation behavior.
- [x] 2.3 Implement the cattle history placeholder use case for existing cattle without inventing activity-event data.
- [x] 2.4 Add protected `GET /api/v1/cattle`, `GET /api/v1/cattle/{id}`, and `GET /api/v1/cattle/{id}/events` routes.
- [x] 2.5 Apply authentication and role authorization so only `ADMIN` and `RESEARCHER` can read cattle endpoints.

## 3. Frontend Cattle Feature

- [x] 3.1 Inspect the existing `frontend/src/features/cattle` placeholder and route conventions.
- [x] 3.2 Add cattle API types and client/query functions for list, detail, and history placeholder calls.
- [x] 3.3 Implement the protected cattle list page with loading, empty, error, and successful summary states.
- [x] 3.4 Implement navigation from cattle list to cattle detail.
- [x] 3.5 Implement the protected cattle detail page with loading, not-found, error, detail, back-navigation, and clearly placeholder history states.
- [x] 3.6 Register cattle routes in the protected application router using the existing auth/session behavior.

## 4. Documentation and Knowledge Base References

- [x] 4.1 Update local module README or setup notes only where needed to explain cattle seed data and verification commands.
- [x] 4.2 Ensure new implementation comments/docs reference Knowledge Base documents instead of copying long cattle requirements.
- [x] 4.3 Confirm no manual cattle create/update/delete workflow is documented as part of this phase.

## 5. Verification

- [x] 5.1 Add backend tests for cattle seed/model rules, list success, detail success, detail not found, invalid id, missing token, and forbidden role.
- [x] 5.2 Add backend tests for the cattle history placeholder route on existing and unknown cattle ids.
- [x] 5.3 Add frontend tests for cattle list loading/empty/error/success states and navigation to detail.
- [x] 5.4 Add frontend tests for cattle detail success, not-found, error, placeholder history, and return-to-list behavior.
- [x] 5.5 Run backend verification commands and fix cattle-related failures.
- [x] 5.6 Run frontend verification commands and fix cattle-related failures.
- [x] 5.7 Run OpenSpec validation/status checks for `add-cattle-management`.
