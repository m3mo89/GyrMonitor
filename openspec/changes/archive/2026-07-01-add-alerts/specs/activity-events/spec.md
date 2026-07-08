## MODIFIED Requirements

### Requirement: Activity event risk and alert integration boundary

The activity-event module SHALL invoke the backend risk-analysis and alert-generation boundary for accepted inactivity events while preserving source-event traceability.

#### Scenario: Inactivity event is evaluated for alert generation

- **WHEN** an `INACTIVITY` event is accepted
- **THEN** the event is made available to the backend risk-analysis boundary for deterministic evaluation and alert threshold handling

#### Scenario: Inactivity event above threshold returns alert integration data

- **WHEN** an `INACTIVITY` event is accepted and alert generation creates a linked alert
- **THEN** event registration returns the accepted event result with alert integration fields in the documented activity-event response shape

#### Scenario: Inactivity event below threshold returns no generated alert

- **WHEN** an `INACTIVITY` event is accepted and risk analysis does not cross the alert threshold
- **THEN** event registration succeeds without reporting a generated alert

#### Scenario: Activity event does not generate alert by default

- **WHEN** an `ACTIVITY` event is accepted
- **THEN** the system does not treat it as an alert-generating inactivity event by default

#### Scenario: Alert generation remains traceable to source event

- **WHEN** alert generation consumes an activity event
- **THEN** the persisted alert links back to the source event using the event's cattle, event id, capture time, inactivity duration, and source data
