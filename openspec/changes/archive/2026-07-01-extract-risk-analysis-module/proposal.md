## Why

`backend/src/inactivity-analysis/` has been an empty placeholder since Phase 1 (`knowledge-base/00-introduction/PROJECT_STRUCTURE.md` and `knowledge-base/99-meta/MODULE_CATALOG.md` both list Risk Analysis as its own backend module). During `add-alerts`, the risk-score/severity calculation described in `knowledge-base/02-domain/risk-analysis.md` was implemented instead as `MvpRiskCalculator` inside `backend/src/alerts/application/risk-calculator.ts`, coupling risk calculation to the alerts module and leaving the documented module boundary unimplemented. Extracting risk analysis into its own module aligns the codebase with the documented architecture, makes the risk policy independently testable/reusable (e.g., by a future dashboard risk-ranking feature per `knowledge-base/02-domain/module-dependency-map.md`), and removes a domain-ownership inconsistency before more modules start depending on alerts for risk data.

## What Changes

- Create a new `backend/src/inactivity-analysis` module (domain/application/infrastructure layers) that owns the deterministic MVP risk policy: evaluating `INACTIVITY` activity events into a `riskScore`, `severity`, and `exceedsAlertThreshold` result, per `knowledge-base/02-domain/risk-analysis.md`.
- Move `MvpRiskCalculator`, `mvpRiskPolicy`, `classifySeverity`, and the `RiskEvaluation` type out of `backend/src/alerts/application/risk-calculator.ts` into the new module, exposed as a port the alerts module consumes.
- Move the `AlertSeverity`/`AlertSeverities` value definitions to the new module (severity is a risk-analysis concept per the domain doc) and have `alerts` import them instead of defining them.
- Update `GenerateAlertFromActivityEventUseCase` (`backend/src/alerts/application/generate-alert-from-activity-event.use-case.ts`) to depend on the risk-analysis module's evaluator port instead of constructing `MvpRiskCalculator` directly.
- Wire the new module into `backend/src/app.module.ts`.
- No changes to public API contracts, request/response shapes, or persisted alert data — this is an internal module-boundary refactor.

## Capabilities

### New Capabilities

- `risk-analysis`: Deterministic MVP risk evaluation (risk score calculation, severity classification, alert-threshold decision) for `INACTIVITY` activity events, owned as its own backend module and consumed by the alerts module.

### Modified Capabilities

- `alerts`: Alert generation no longer performs risk calculation itself; it SHALL delegate risk-score/severity/threshold evaluation to the `risk-analysis` capability and consume its result when deciding whether to create an alert. Externally observable alert behavior (thresholds, severities, generated alerts) is unchanged.

## Impact

- Affected code: `backend/src/alerts/application/risk-calculator.ts`, `backend/src/alerts/application/generate-alert-from-activity-event.use-case.ts`, `backend/src/alerts/domain/alert.ts` (severity type source), `backend/src/alerts/alerts.module.ts`, `backend/src/alerts/application/alert.use-cases.spec.ts`, `backend/src/app.module.ts`.
- New code: `backend/src/inactivity-analysis/` (domain, application, infrastructure) replacing the placeholder README.
- No database migration required (no new persisted fields).
- No frontend or API contract changes.
