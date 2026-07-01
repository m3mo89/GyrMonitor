## Context

`knowledge-base/00-introduction/PROJECT_STRUCTURE.md` and `knowledge-base/99-meta/MODULE_CATALOG.md` document `inactivity-analysis` (a.k.a. Risk Analysis) as its own backend module, separate from `alerts`. No roadmap phase ever scheduled its standalone implementation, so during `add-alerts` (`openspec/changes/archive/2026-07-01-add-alerts/design.md`, decision 2) the risk evaluator was implemented directly inside the alerts module as `MvpRiskCalculator`. `backend/src/inactivity-analysis/` has remained an empty placeholder (`README.md` only) ever since. The alerts spec (`openspec/specs/alerts/spec.md`) and tests (`alert.use-cases.spec.ts`) currently treat risk calculation as an alerts-internal concern.

This change only moves the existing, already-tested risk logic to its documented location and updates the one call site that uses it. No new behavior, thresholds, or API surface is introduced.

## Goals / Non-Goals

**Goals:**
- Implement `backend/src/inactivity-analysis` following the Clean Architecture layout used by other backend modules (`domain/`, `application/`, `infrastructure/`).
- Preserve the exact current MVP risk policy (`alertThreshold: 60`, `highSeverityThreshold: 80`, `mediumSeverityThreshold: 60`) and its deterministic behavior.
- Give `alerts` a narrow port to consume risk evaluation, so it no longer owns the calculation.
- Keep all existing alert generation tests (`alert.use-cases.spec.ts`, `alerts.e2e-spec.ts`) passing without changes to their assertions.

**Non-Goals:**
- No new risk rules, configurable thresholds, or ML-based scoring (still explicitly future work per `knowledge-base/02-domain/risk-analysis.md`).
- No changes to the `/api/v1/alerts` contract, DTOs, or persisted schema.
- No dashboard risk-ranking feature — this change only prepares the module boundary that future dashboard work could depend on, per `knowledge-base/02-domain/module-dependency-map.md`.

## Decisions

1. **New module owns evaluation; alerts owns a consumer port.**
   `backend/src/inactivity-analysis/application/risk-evaluator.ts` exposes `MvpRiskCalculator` (renamed responsibility, same class shape) behind an `ActivityEventRiskEvaluator` interface. `alerts` defines/uses that interface type (already shaped like `ActivityAlertEvaluator` today) instead of importing `MvpRiskCalculator` directly from another module's `application` layer.
   Alternative considered: keep `MvpRiskCalculator` inside `alerts` and only move the standalone `classifySeverity`/`mvpRiskPolicy` constants. Rejected because the class itself, not just the policy constants, is the piece `knowledge-base/02-domain/risk-analysis.md` and the module catalog attribute to Risk Analysis.

2. **`AlertSeverity`/`AlertSeverities` move to `inactivity-analysis/domain`.**
   Severity is a risk-analysis concept ("Classifying severity" is listed under Risk Analysis responsibilities in `risk-analysis.md`), not an alerts concept. `alerts/domain/alert.ts` will import `AlertSeverity` from `inactivity-analysis` instead of defining it, keeping the alert domain record focused on lifecycle/status/traceability.
   Alternative considered: leave severity type in `alerts` and only export the calculator. Rejected because it keeps a domain concept split across two modules, which is exactly the ownership drift this change is meant to fix.

3. **Wiring stays constructor-injected, no new HTTP/DB surface.**
   `backend/src/inactivity-analysis` has no controller and no repository — it is a pure domain/application module (a calculator), consistent with `MODULE_CATALOG.md` listing its Engineering Area as "Backend" only, and `risk-analysis.md` describing it as calculation logic, not a stored entity. `GenerateAlertFromActivityEventUseCase` receives the evaluator via constructor injection, same pattern as today but sourced from the new module's singleton/factory.
   Alternative considered: add a `RiskEvaluationRepository` for future auditing of past evaluations. Rejected as speculative — not required by any current spec or roadmap phase.

4. **No API or migration changes.**
   Because risk evaluation is a pure function of an `ActivityEvent`, moving it does not change persisted alert fields or endpoint responses. This keeps the change reviewable as a pure refactor.

## Risks / Trade-offs

- Renaming/moving `MvpRiskCalculator` could silently break an import elsewhere → Mitigation: `grep` confirmed the only consumer is `generate-alert-from-activity-event.use-case.ts`; update it in the same change and run the full backend test suite before completion.
- Moving `AlertSeverity` could ripple into places importing it from `alerts/domain/alert.ts` (e.g., `alert.types.ts`, repositories, controller) → Mitigation: re-export or update each import; verify with a full type-check (`tsc --noEmit`) after the move, not just the touched files.
- Spec text for `alerts` needs to change without altering externally observable behavior → Mitigation: keep all existing scenarios' WHEN/THEN outcomes identical; only the requirement description changes to state delegation to `risk-analysis`.

## Migration Plan

- Create `backend/src/inactivity-analysis/{domain,application,infrastructure}` with the moved calculator, policy constants, and severity type; add unit tests mirroring the moved logic's current coverage.
- Update `backend/src/alerts` to import from the new module and drop the local `risk-calculator.ts`.
- Register the new module in `backend/src/app.module.ts` (module with no controllers, exporting the evaluator provider for `alerts` to inject).
- Run backend unit + e2e tests (`alert.use-cases.spec.ts`, `alerts.e2e-spec.ts`, `dashboard` tests that read alert data) to confirm no behavior change.
- Rollback is trivial before archive: revert the commit, since no migration or persisted data is involved.

## Open Questions

- None — this is a same-behavior module extraction; no product decisions are pending.
