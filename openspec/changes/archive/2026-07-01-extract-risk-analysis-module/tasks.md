## 1. Scaffold the risk-analysis module

- [x] 1.1 Create `backend/src/inactivity-analysis/{domain,application,infrastructure}` directories, replacing the placeholder `README.md` content with a short module description.
- [x] 1.2 Move `AlertSeverity`/`AlertSeverities` from `backend/src/alerts/domain/alert.ts` into `backend/src/inactivity-analysis/domain/`, and update `alerts/domain/alert.ts` to import them from the new location.
- [x] 1.3 Move `mvpRiskPolicy`, `classifySeverity`, `MvpRiskCalculator`, and `RiskEvaluation` from `backend/src/alerts/application/risk-calculator.ts` into `backend/src/inactivity-analysis/application/`, updating imports to the moved `AlertSeverity` type.
- [x] 1.4 Define an `ActivityEventRiskEvaluator` port/interface in `inactivity-analysis` describing the `evaluate(event): RiskEvaluation | null` contract consumed by other modules.
- [x] 1.5 Create `backend/src/inactivity-analysis/inactivity-analysis.module.ts` exporting the evaluator provider, with no controllers or repositories.

## 2. Rewire the alerts module to consume risk-analysis

- [x] 2.1 Delete `backend/src/alerts/application/risk-calculator.ts` once its contents are moved.
- [x] 2.2 Update `GenerateAlertFromActivityEventUseCase` (`generate-alert-from-activity-event.use-case.ts`) to depend on the `risk-analysis` evaluator port instead of importing `MvpRiskCalculator` directly.
- [x] 2.3 Update `backend/src/alerts/alerts.module.ts` and any alert singleton wiring (`alert-singletons.ts`) to inject the risk evaluator from `inactivity-analysis` instead of instantiating it locally.
- [x] 2.4 Update remaining `alerts` imports of `AlertSeverity`/`AlertSeverities` (domain, application, infrastructure, http) to source them from `inactivity-analysis`.

## 3. Wire into the backend composition root

- [x] 3.1 Register `InactivityAnalysisModule` in `backend/src/app.module.ts`, imported by `AlertsModule`.

## 4. Tests

- [x] 4.1 Move/adapt the risk-calculation unit tests currently embedded in `alert.use-cases.spec.ts` into a new `inactivity-analysis` spec file covering risk score, threshold, and severity scenarios from `specs/risk-analysis/spec.md`.
- [x] 4.2 Update `alert.use-cases.spec.ts` to inject a risk evaluator (real or test double) via the new port, keeping existing alert-generation assertions unchanged.
- [x] 4.3 Run `alerts.e2e-spec.ts` and `dashboard.e2e-spec.ts` to confirm no behavioral regression in alert generation or dashboard metrics that read alert/severity data.
- [x] 4.4 Run the full backend test suite and `tsc --noEmit` to catch any missed import of the moved `AlertSeverity` type or calculator.

## 5. Documentation

- [x] 5.1 Skipped: `git log` shows `MODULE_CATALOG.md` has never been updated for any completed module (Alerts, Dashboard, Authentication, etc. are all still "Planned" despite being implemented and archived). Updating only the Risk Analysis row would be inconsistent with every other row and out of scope for this refactor; left for a dedicated documentation-maintenance change.
- [x] 5.2 Update `backend/src/inactivity-analysis/README.md` to describe the implemented module instead of the Phase 1 placeholder text.
