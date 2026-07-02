## ADDED Requirements

### Requirement: Desktop simulator cattle selection
The desktop event simulator SHALL allow administrators to select an existing cattle record without manually typing a cattle UUID.

#### Scenario: Simulator loads cattle options
- **WHEN** an authenticated administrator opens the desktop event simulator with connectivity available
- **THEN** the simulator loads cattle records from the existing cattle API and presents selectable cattle options with human-readable identifiers

#### Scenario: Selected cattle id is used for generated event
- **WHEN** an administrator selects a cattle record and generates a simulated event
- **THEN** the generated `PendingEvent` stores the selected record's backend `cattleId`

#### Scenario: Missing selection blocks generation
- **WHEN** an administrator attempts to generate a simulated event without a selected cattle record
- **THEN** the app displays a validation error and does not create a pending event or sync queue item

### Requirement: Desktop simulator release usability
The desktop simulator SHALL keep UUID entry out of the primary release workflow while preserving traceability to the backend cattle id.

#### Scenario: Simulator does not require memorized UUIDs
- **WHEN** an administrator performs the release smoke flow for event simulation
- **THEN** the administrator can complete the flow using visible cattle information instead of copying a UUID from backend data or seed files
