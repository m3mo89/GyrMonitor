## ADDED Requirements

### Requirement: Risk evaluation of inactivity events

The backend SHALL provide a deterministic risk evaluator, owned by the `risk-analysis` module, that converts an `INACTIVITY` activity event into a `riskScore`, `severity`, and `exceedsAlertThreshold` result, as described in `knowledge-base/02-domain/risk-analysis.md`.

#### Scenario: Inactivity event produces a risk evaluation

- **WHEN** the risk evaluator receives an `INACTIVITY` activity event with an `inactiveMinutes` value
- **THEN** it returns a `riskScore` derived deterministically from `inactiveMinutes`, capped at 100

#### Scenario: Non-inactivity event produces no risk evaluation

- **WHEN** the risk evaluator receives an activity event whose type is not `INACTIVITY`
- **THEN** it returns no risk evaluation result

#### Scenario: Risk score above alert threshold is flagged

- **WHEN** a computed `riskScore` is greater than or equal to the configured alert threshold
- **THEN** the evaluation result marks `exceedsAlertThreshold` as true

#### Scenario: Risk score below alert threshold is not flagged

- **WHEN** a computed `riskScore` is below the configured alert threshold
- **THEN** the evaluation result marks `exceedsAlertThreshold` as false

### Requirement: Severity classification

The backend SHALL classify a `riskScore` into a `severity` of `LOW`, `MEDIUM`, or `HIGH` using the deterministic MVP thresholds owned by the `risk-analysis` module, as described in `knowledge-base/02-domain/risk-analysis.md`.

#### Scenario: High severity classification

- **WHEN** a `riskScore` is greater than or equal to the configured high-severity threshold
- **THEN** the evaluator classifies the severity as `HIGH`

#### Scenario: Medium severity classification

- **WHEN** a `riskScore` is at or above the configured medium-severity threshold and below the high-severity threshold
- **THEN** the evaluator classifies the severity as `MEDIUM`

#### Scenario: Low severity classification

- **WHEN** a `riskScore` is below the configured medium-severity threshold
- **THEN** the evaluator classifies the severity as `LOW`

### Requirement: Risk evaluation is consumable by other modules

The backend SHALL expose risk evaluation as an injectable port so other backend modules can consume it without duplicating or re-implementing risk calculation, as required by `knowledge-base/02-domain/module-dependency-map.md` (Risk Analysis is depended on by Alerts and Dashboard).

#### Scenario: Alerts module consumes the risk evaluation port

- **WHEN** the alerts module needs a risk evaluation for an activity event
- **THEN** it invokes the `risk-analysis` module's evaluator port rather than performing its own risk calculation
