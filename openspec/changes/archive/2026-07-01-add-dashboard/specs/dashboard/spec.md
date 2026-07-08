## ADDED Requirements

### Requirement: Dashboard metrics API

The backend SHALL expose protected `GET /api/v1/dashboard` behavior aligned with `knowledge-base/05-api/dashboard.md`, `knowledge-base/05-api/conventions.md`, and `knowledge-base/05-api/security.md`.

#### Scenario: Authorized user gets dashboard metrics

- **WHEN** an authenticated `ADMIN` or `RESEARCHER` requests `GET /api/v1/dashboard`
- **THEN** the API returns a successful dashboard metrics response using the documented field names and standard API envelope

#### Scenario: Missing token cannot access dashboard

- **WHEN** a request without a valid bearer token is made to `GET /api/v1/dashboard`
- **THEN** the API returns `UNAUTHORIZED`

#### Scenario: Unauthorized role cannot access dashboard

- **WHEN** an authenticated user without dashboard permission requests `GET /api/v1/dashboard`
- **THEN** the API returns `FORBIDDEN`

#### Scenario: Date range query is accepted

- **WHEN** an authorized caller requests dashboard metrics with valid `from` and `to` ISO date query parameters
- **THEN** the response is calculated for the requested period without changing the documented response shape

### Requirement: Backend dashboard aggregate source

The backend SHALL calculate dashboard values from backend-owned data sources and SHALL NOT require the frontend to calculate critical metrics, as required by `knowledge-base/10-roadmap/phase-7-dashboard.md`, `knowledge-base/05-api/dashboard.md`, and `knowledge-base/08-decisions/ADR-009-metrics-visualization.md`.

#### Scenario: Dashboard includes required MVP metrics

- **WHEN** dashboard metrics are requested by an authorized user
- **THEN** the response includes total cattle, active alerts, average risk score, high-risk cattle, events today, pending sync count, risk ranking, and trend data

#### Scenario: Risk ranking is backend calculated

- **WHEN** the dashboard response includes `riskRanking`
- **THEN** each ranking item is ordered by backend-calculated risk data and includes the documented cattle id, tag number, and risk score fields

#### Scenario: Trend data is backend calculated

- **WHEN** the dashboard response includes `trend`
- **THEN** each trend item includes the documented date, events, and alerts fields for the selected period

#### Scenario: Empty source data returns zeroed dashboard

- **WHEN** no cattle, alerts, activity events, or pending sync records exist for the dashboard scope
- **THEN** the backend returns a successful dashboard response with empty lists and zero or neutral aggregate values instead of an error

### Requirement: Dashboard performance target

The dashboard API SHALL satisfy the typical MVP response target documented in `knowledge-base/05-api/dashboard.md`.

#### Scenario: Typical dashboard query meets response target

- **WHEN** an authorized user requests dashboard metrics using typical MVP data volumes
- **THEN** the backend responds within the documented dashboard performance target

### Requirement: Frontend dashboard route

The frontend SHALL provide a protected `/dashboard` workflow for `ADMIN` and `RESEARCHER`, aligned with `knowledge-base/06-engineering/frontend/routing.md` and `knowledge-base/10-roadmap/phase-7-dashboard.md`.

#### Scenario: Authorized user views dashboard page

- **WHEN** an authenticated `ADMIN` or `RESEARCHER` navigates to `/dashboard`
- **THEN** the frontend requests dashboard metrics and displays the key metric, risk ranking, and trend sections from the backend response

#### Scenario: Unauthenticated user is redirected

- **WHEN** an unauthenticated user navigates to `/dashboard`
- **THEN** the frontend redirects the user to the login workflow

#### Scenario: Unauthorized user sees access denied

- **WHEN** an authenticated user without dashboard permission navigates to `/dashboard`
- **THEN** the frontend shows an access denied state instead of dashboard data

### Requirement: Frontend dashboard states

The frontend dashboard SHALL distinguish loading, success, empty, error, retry, and stale-data states according to `knowledge-base/08-decisions/ADR-008-error-empty-states.md`, `knowledge-base/06-engineering/frontend/cache.md`, and `knowledge-base/06-engineering/frontend/testing.md`.

#### Scenario: Dashboard shows loading state

- **WHEN** the dashboard route is waiting for the initial metrics request
- **THEN** the frontend displays a loading state without showing fabricated metrics

#### Scenario: Dashboard shows empty state

- **WHEN** the dashboard API returns successful zero or empty aggregate data
- **THEN** the frontend displays an empty state that is distinct from an error

#### Scenario: Dashboard shows error state with retry

- **WHEN** the dashboard API request fails and no usable cached data is available
- **THEN** the frontend displays an error state with a retry action

#### Scenario: Dashboard indicates stale cached data

- **WHEN** a refetch fails after previously loaded dashboard data exists
- **THEN** the frontend may keep the previous data visible but MUST indicate that it is stale

### Requirement: Dashboard visualization rules

The frontend dashboard SHALL visualize backend dashboard data without duplicating critical business calculations, following `knowledge-base/06-engineering/frontend/react-architecture.md` and `knowledge-base/08-decisions/ADR-009-metrics-visualization.md`.

#### Scenario: Metric cards use backend values

- **WHEN** the dashboard renders total cattle, active alerts, average risk score, high-risk cattle, events today, or pending sync count
- **THEN** each displayed value matches the corresponding backend response field after presentation formatting only

#### Scenario: Risk ranking uses backend values

- **WHEN** the dashboard renders the risk ranking section
- **THEN** the displayed ranking uses the backend-provided ranking order and risk scores

#### Scenario: Trend chart uses backend values

- **WHEN** the dashboard renders trend visualization
- **THEN** the chart uses backend-provided trend dates, event counts, and alert counts without recalculating trend aggregates in the browser
