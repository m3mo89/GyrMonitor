# Frontend

React + TypeScript frontend for GyrMonitor, organized by feature with Clean Architecture layering per feature (`domain/`, `application/`, `infrastructure/`, `presentation/`) — see `src/features/README.md`.

Source guidance:

- `knowledge-base/06-engineering/frontend/overview.md`
- `knowledge-base/07-reference/directory-map.md`
- `knowledge-base/06-engineering/frontend/routing.md`
- `knowledge-base/06-engineering/frontend/state-management.md`
- `knowledge-base/08-decisions/ADR-007-jwt-route-guards.md`

## Implemented Features

- `auth` — login, session state, shared API token handling, protected route behavior, role denial state, logout, 401 cleanup.
- `user-management` — ADMIN-only user list, creation, disable/reactivate, and password reset.
- `dashboard` — aggregate metrics query and chart presentation.
- `cattle` — list/detail/history screens.
- `alerts` — list/detail pages, observations, status mutation workflow.
- `events` and `metrics` remain placeholder/deferred (see `src/features/README.md`); cattle detail shows read-only event history in place of a dedicated events UI.

## Localization

UI text is sourced from `i18next` JSON namespaces under `src/shared/i18n/locales/`, defaulting to Spanish (`es`). See `openspec/specs/ui-localization/spec.md`.

## Local Authentication

Point `VITE_API_BASE_URL` at the backend API root, for example `http://localhost:3000/api/v1`. Use only local/test credentials documented by the backend README.

## Staging Configuration

Vercel staging can use the branch-specific build command:

```sh
npm run build:staging --workspace frontend
```

That command builds `https://gyr-monitor-staging.vercel.app` against `https://gyrmonitor-staging.up.railway.app/api/v1`. Local development keeps using `npm run dev --workspace frontend` and the local API fallback. The generic `npm run build --workspace frontend` also infers staging when `VERCEL_GIT_COMMIT_REF=staging`.

If Vercel uses the generic build command instead, set `VITE_API_BASE_URL=https://gyrmonitor-staging.up.railway.app/api/v1` in the staging branch environment.

Vite reads `VITE_*` variables at build time. After changing `VITE_API_BASE_URL` in Vercel, redeploy the frontend so the generated bundle stops using any previous value. A deployed build that falls back to a localhost API URL is a staging misconfiguration.

## Production Configuration

Vercel production should use the production branch build command:

```sh
npm run build:production --workspace frontend
```

That command builds `https://gyr-monitor.vercel.app` against `https://gyrmonitor-production.up.railway.app/api/v1` and rejects local, staging, or unexpected API URLs. The generic `npm run build --workspace frontend` also infers production when `VERCEL_ENV=production`.

## Commands

```sh
npm run build --workspace frontend
npm run lint --workspace frontend
npm run format:check --workspace frontend
npm run test --workspace frontend
```
