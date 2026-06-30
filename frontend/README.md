# Frontend Foundation

This folder contains the React + TypeScript frontend foundation for GyrMonitor.

Source guidance:

- `knowledge-base/06-engineering/frontend/overview.md`
- `knowledge-base/07-reference/directory-map.md`
- `knowledge-base/06-engineering/frontend/routing.md`
- `knowledge-base/06-engineering/frontend/state-management.md`
- `knowledge-base/08-decisions/ADR-007-jwt-route-guards.md`

The current frontend includes the Phase 2 authentication foundation: login page, session state, shared API token handling, protected route behavior, role denial state, logout, and 401 cleanup. Dashboards, cattle views, events, alerts, metrics, and synchronization workflows remain future work.

## Local Authentication

Point `VITE_API_BASE_URL` at the backend API root, for example `http://localhost:3000/api/v1`. Use only local/test credentials documented by the backend README.

## Commands

```sh
npm run build --workspace frontend
npm run lint --workspace frontend
npm run format:check --workspace frontend
npm run test --workspace frontend
```
