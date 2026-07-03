# Alerts Feature Boundary

Implemented: alerts list and detail pages, observations list, and the `ADMIN`/`FIELD_OPERATOR` status-transition workflow (`PENDING` -> `IN_PROGRESS` -> `ATTENDED`). Data fetching uses the shared `useApiQuery` hook (ADR-004); status updates go through `alerts.api.ts` and update the TanStack Query cache directly.
