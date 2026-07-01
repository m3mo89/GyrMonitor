## 1. Backend Contract

- [x] 1.1 Define dashboard response/query DTO types matching `knowledge-base/05-api/dashboard.md` and API envelope conventions.
- [x] 1.2 Add dashboard validation for optional `from`, `to`, and documented future `corralId` query parameters.
- [x] 1.3 Implement protected `GET /api/v1/dashboard` controller behavior for `ADMIN` and `RESEARCHER`.

## 2. Backend Aggregation

- [x] 2.1 Replace the dashboard placeholder with a module/use case/query service boundary for `GetDashboardMetricsUseCase`.
- [x] 2.2 Aggregate total cattle, active alerts, average risk score, high-risk cattle, events today, and pending sync count from backend-owned sources.
- [x] 2.3 Aggregate risk ranking with backend-provided cattle id, tag number, and risk score ordering.
- [x] 2.4 Aggregate trend data by date for the requested period using backend event and alert data.
- [x] 2.5 Return successful zero or neutral dashboard values when source data is empty.

## 3. Frontend Data Access

- [x] 3.1 Add approved dashboard remote-state support, including TanStack Query setup if it is not already configured.
- [x] 3.2 Add feature-owned dashboard API client/types under `frontend/src/features/dashboard`.
- [x] 3.3 Add a dashboard query hook with short stale time and stale-data detection behavior.

## 4. Frontend Route and UI

- [x] 4.1 Register protected `/dashboard` routing for `ADMIN` and `RESEARCHER`.
- [x] 4.2 Add a presentable private app shell with responsive layout, navigation, session/role context, and clear active-route affordances.
- [x] 4.3 Establish a small visual foundation for the MVP web app: typography, spacing, color tokens, buttons, tables, form fields, status badges, and page containers.
- [x] 4.4 Build reusable loading, empty, error, retry, access-denied, and stale-data state components with polished copy and consistent spacing.
- [x] 4.5 Build dashboard metric sections for total cattle, active alerts, average risk score, high-risk cattle, events today, and pending sync count.
- [x] 4.6 Build risk ranking and trend visualization using backend-provided values only.
- [x] 4.7 Restyle existing login and cattle list/detail screens enough to match the dashboard app shell and avoid a mixed placeholder/polished experience.
- [x] 4.8 Apply basic accessibility, responsive behavior, and readable operational layout expectations from the frontend knowledge-base guidance.

## 5. Tests and Validation

- [x] 5.1 Add backend unit tests for dashboard aggregation, empty data, date range behavior, risk ranking, and trend output.
- [x] 5.2 Add backend HTTP/e2e tests for success, `UNAUTHORIZED`, and `FORBIDDEN` dashboard access.
- [x] 5.3 Add frontend tests for loading, success, empty, error/retry, stale-data indicator, and protected route behavior.
- [x] 5.4 Verify the dashboard, login, and cattle screens at desktop and narrow mobile widths for readable layout, no overlapping text, and coherent visual states.
- [x] 5.5 Run backend build/test commands and frontend build/test commands documented in each package.
- [x] 5.6 Verify OpenSpec status for `add-dashboard` before implementation handoff.
