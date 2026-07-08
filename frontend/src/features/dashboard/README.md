# Dashboard Feature Boundary

Implemented per `knowledge-base/10-roadmap/phase-7-dashboard.md` and ADR-009: total cattle, active alerts, average risk score, high-risk cattle count, events today, pending sync count, risk ranking, and trend visualization, all backed by the `/dashboard` aggregate endpoint via `useDashboardMetrics`.

This page already covers the full scope of ADR-009 ("Visualize Metrics from Backend Aggregates"). No separate metrics phase or roadmap item exists beyond this. See `features/metrics/README.md` for the recommendation to treat that folder as superseded by this feature pending explicit product sign-off.

```text
domain/          Dashboard aggregate and chart data types
application/     Dashboard metrics query hook
infrastructure/  Dashboard HTTP API adapter
presentation/    Dashboard page and chart rendering
```
