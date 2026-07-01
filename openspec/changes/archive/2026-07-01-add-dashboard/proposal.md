## Why

Phase 7 introduces the operational dashboard promised by the MVP roadmap so administrators and researchers can see herd status, risk signals, trends, and ranking from one protected web entry point. The source of truth for scope and acceptance is `knowledge-base/10-roadmap/phase-7-dashboard.md`, with the API contract in `knowledge-base/05-api/dashboard.md`.

## What Changes

- Add the dashboard capability covering `GET /api/v1/dashboard`, including global metrics, risk ranking, trend data, optional date range filters, and role-based access for `ADMIN` and `RESEARCHER`.
- Add a React dashboard page at `/dashboard` that consumes backend-calculated aggregates through typed API clients and TanStack Query.
- Represent total cattle, active alerts, average risk score, high-risk cattle, events today, pending sync count, risk ranking, and trend data as visual dashboard sections without duplicating business-critical calculations in the frontend.
- Handle loading, empty, error, retry, and stale-data states according to the frontend/API decisions in the knowledge base.
- Add backend and frontend tests for the dashboard contract, authorization, aggregation behavior, and user-visible UI states.

## Capabilities

### New Capabilities

- `dashboard`: Operational visibility through backend dashboard aggregates, protected API access, and a React dashboard page. Requirements are sourced from `knowledge-base/10-roadmap/phase-7-dashboard.md`, `knowledge-base/05-api/dashboard.md`, `knowledge-base/03-requirements/functional-requirements.md#dashboard`, and related frontend/API guidance.

### Modified Capabilities

- None.

## Impact

- Backend: new dashboard module/use case/query service, controller route, DTOs, authorization, aggregation tests, and integration with existing cattle, activity-events, alerts, risk, and sync data.
- Frontend: new `features/dashboard` area, protected `/dashboard` route, typed dashboard API client, TanStack Query hook, metric cards, risk ranking, trend visualization, and state handling.
- API contract: `GET /api/v1/dashboard` follows `knowledge-base/05-api/conventions.md`, `knowledge-base/05-api/security.md`, and `knowledge-base/05-api/dashboard.md`.
- Documentation traceability: proposal intentionally references knowledge-base documents instead of duplicating long requirements or DTO examples.
