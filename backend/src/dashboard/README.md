# Dashboard Module

Implements aggregated metrics for administrators and researchers.

- `GET /dashboard` (`ADMIN`, `RESEARCHER`) — returns aggregated dashboard metrics, optionally filtered by `from`, `to` (date range) and `corralId`.

See `knowledge-base/05-api/dashboard.md` for the query parameter contract and response shape.
