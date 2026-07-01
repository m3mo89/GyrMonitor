## MODIFIED Requirements

### Requirement: Alert generation from inactivity
The backend SHALL evaluate accepted inactivity events and generate alerts when the `risk-analysis` capability's evaluator determines that attention is required, as described in `knowledge-base/10-roadmap/phase-6-alerts.md` and `knowledge-base/02-domain/risk-analysis.md`. The alerts module SHALL NOT perform its own risk-score or severity calculation; it SHALL delegate that evaluation to the `risk-analysis` capability and act on the returned result.

#### Scenario: Inactivity above threshold creates alert
- **WHEN** an authorized caller registers a valid `INACTIVITY` event whose calculated risk score exceeds the alert threshold
- **THEN** the backend persists a new `PENDING` alert linked to the same cattle record and source activity event

#### Scenario: Inactivity below threshold does not create alert
- **WHEN** an authorized caller registers a valid `INACTIVITY` event whose calculated risk score does not exceed the alert threshold
- **THEN** the backend persists the event without creating an alert

#### Scenario: Activity event does not create alert
- **WHEN** an authorized caller registers a valid `ACTIVITY` event
- **THEN** the backend does not create an alert from that event by default

#### Scenario: Duplicate event does not duplicate alert
- **WHEN** event registration is retried with an `eventId` that already generated an alert
- **THEN** the backend does not create an additional alert for the same source event
