# Alerts

Implements MVP alert generation, listing, detail lookup, status lifecycle updates, MariaDB persistence, and activity-event traceability.

Source guidance:

- `knowledge-base/10-roadmap/phase-6-alerts.md`
- `knowledge-base/02-domain/alerts.md`
- `knowledge-base/02-domain/risk-analysis.md`
- `knowledge-base/05-api/alerts.md`

The MVP risk policy (risk score, severity, alert threshold) is calculated by the `inactivity-analysis` module and consumed here via the `ActivityEventRiskEvaluator` port, so thresholds can be adjusted during validation without changing the public API contract.
