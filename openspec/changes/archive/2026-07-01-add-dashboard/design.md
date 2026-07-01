## Context

Phase 7 completes the MVP dashboard described in `knowledge-base/10-roadmap/phase-7-dashboard.md`. The current repository already has placeholder dashboard boundaries at `backend/src/dashboard` and `frontend/src/features/dashboard`, while the required source data lives in existing cattle, activity-events, alerts, risk, and offline-sync modules. The dashboard API contract and roles are defined in `knowledge-base/05-api/dashboard.md` and `knowledge-base/05-api/security.md`.

The dashboard must expose backend-calculated aggregates and a protected React page. The frontend must visualize and format data, but it must not recalculate critical risk, alert, or operational metrics; that constraint is captured in `knowledge-base/08-decisions/ADR-009-metrics-visualization.md` and `knowledge-base/06-engineering/frontend/react-architecture.md`.

## Goals / Non-Goals

**Goals:**

- Implement `GET /api/v1/dashboard` for `ADMIN` and `RESEARCHER` using the response contract in `knowledge-base/05-api/dashboard.md`.
- Aggregate total cattle, active alerts, average risk score, high-risk cattle, events today, pending sync count, risk ranking, and trend data from backend sources.
- Add a protected `/dashboard` React route that consumes the typed dashboard API response.
- Establish a presentable private web UI foundation for the MVP: app shell, navigation, consistent visual language, responsive dashboard layout, and polished operational states.
- Provide user-visible loading, empty, error, retry, and stale-data states aligned with `knowledge-base/08-decisions/ADR-008-error-empty-states.md` and `knowledge-base/06-engineering/frontend/cache.md`.
- Cover backend contract/authorization/aggregation behavior and frontend dashboard states with tests.

**Non-Goals:**

- No exportable reports, read replicas, cached projections, time-series storage, or corral/location filtering beyond accepting the documented future `corralId` query shape if the backend chooses to validate it.
- No frontend-side recalculation of business-critical metrics.
- No mobile or desktop offline dashboard workflow beyond exposing `syncPendingCount` from available backend data.
- No changes to cattle, alert, event, observation, or sync requirements except as needed to read their existing persisted data.

## Decisions

1. Implement dashboard as a backend read model/use case over existing repositories.

   The dashboard module should expose a `GetDashboardMetricsUseCase` or query service that composes existing persisted data and returns a DTO matching `knowledge-base/05-api/dashboard.md`. This keeps business logic on the backend and avoids coupling the HTTP controller to individual persistence details. Alternative considered: calculate values in the browser from list endpoints. Rejected because ADR-009 and the API contract require backend aggregates.

2. Keep the first implementation direct, with cache/projection work deferred.

   MVP queries should compute from MariaDB-backed repositories or focused read queries and meet the documented typical response target from `knowledge-base/05-api/dashboard.md`. Alternative considered: create a dashboard projection table immediately. Rejected for Phase 7 because the knowledge base lists cached projections as future evolution, and the MVP can start with direct aggregate queries plus tests.

3. Treat the frontend dashboard as a feature-owned workflow.

   Add dashboard types, API calls, query hook, page, metric sections, risk ranking, and trend visualization inside `frontend/src/features/dashboard`, using shared components only for genuinely reusable loading/error/empty/status primitives. Alternative considered: place dashboard code under shared metrics. Rejected because `knowledge-base/06-engineering/frontend/react-architecture.md` says features own their components, hooks, API calls, and types unless shared.

4. Add a presentable MVP app shell as part of the dashboard phase.

   The current frontend is functional but visually minimal, so Phase 7 should introduce a restrained private application layout with navigation, spacing, typography, tables, metric cards, and state components suitable for an operational tool. Alternative considered: defer UI polish to Phase 9. Rejected because the dashboard is the primary web surface and should become the visual baseline for later alerts, cattle, and metrics work.

5. Use TanStack Query for dashboard remote state when implementation begins.

   `knowledge-base/08-decisions/ADR-004-tanstack-query.md` makes TanStack Query the remote-state decision, and `knowledge-base/06-engineering/frontend/cache.md` calls for short stale time on dashboard metrics with stale-data indication. The current frontend package does not yet include TanStack Query, so implementation should add the dependency/configuration as part of this change. Alternative considered: plain `useEffect` fetch state. Rejected because it would bypass the approved cache/retry/stale-state decision.

6. Use a lightweight chart implementation for trend visualization.

   Trend data must be readable and testable without introducing a heavyweight BI layer. Implementation can add a lightweight React chart library or a small accessible chart component if dependency review favors no new chart package. Alternative considered: external BI tooling. Rejected for MVP, consistent with ADR-009.

## Risks / Trade-offs

- [Risk] Direct aggregate queries may become slow as data grows. -> Mitigation: keep queries focused, add tests around the MVP response target where practical, and leave projection/caching as documented future evolution.
- [Risk] Metric semantics drift from domain modules. -> Mitigation: source scenarios from `knowledge-base/05-api/dashboard.md` and reuse existing repositories/query helpers rather than duplicating domain rules.
- [Risk] Dashboard UI may show stale operational data as current. -> Mitigation: use short stale time and a visible stale-data indicator after failed refetches, following `knowledge-base/06-engineering/frontend/cache.md`.
- [Risk] Empty data can be confused with API failure. -> Mitigation: implement distinct empty and error states as required by ADR-008.
- [Risk] Adding frontend dependencies can increase setup friction. -> Mitigation: keep additions limited to approved remote-state and lightweight visualization needs, and cover them with build/test scripts already present in the frontend package.
