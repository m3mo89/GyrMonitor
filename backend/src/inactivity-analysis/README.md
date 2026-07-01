# Inactivity Analysis (Risk Analysis)

Implements the deterministic MVP risk evaluation described in `knowledge-base/02-domain/risk-analysis.md`: converts `INACTIVITY` activity events into a `riskScore`, a `severity` (`LOW`/`MEDIUM`/`HIGH`), and an alert-threshold decision.

This module has no controller and no repository — it is a pure domain/application calculator consumed by other modules (currently `alerts`) via the `ActivityEventRiskEvaluator` port. It owns the `AlertSeverity` value type since severity classification is a risk-analysis responsibility.

Source guidance:

- `knowledge-base/02-domain/risk-analysis.md`
- `knowledge-base/02-domain/module-dependency-map.md`
- `knowledge-base/10-roadmap/phase-6-alerts.md`
