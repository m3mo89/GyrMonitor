## ADDED Requirements

### Requirement: Desktop dashboard visual presentation
The desktop dashboard screen SHALL present its summary metrics (total cattle, active alerts, high-risk cattle, average risk score, events today, pending sync) as visually distinct metric cards using the shared desktop UI design system, rather than bare labels in a grid.

#### Scenario: Dashboard metrics render as cards
- **WHEN** an authenticated administrator opens the desktop dashboard screen with metrics loaded
- **THEN** each metric is displayed inside a styled card with a label and value, using the shared card style

#### Scenario: Empty risk ranking shows empty state
- **WHEN** an authenticated administrator opens the desktop dashboard screen and the risk ranking list is empty
- **THEN** the screen displays the shared empty-state view in place of the risk ranking list

### Requirement: Desktop list screen visual presentation
The desktop cattle and alerts screens SHALL present each record as a styled card-style row with clear visual hierarchy (primary identifier, secondary detail, status/severity badge) using the shared desktop UI design system, and SHALL display the shared empty-state view when their bound collection is empty after loading.

#### Scenario: Alert row shows severity as a badge
- **WHEN** an authenticated administrator opens the desktop alerts screen with alerts loaded
- **THEN** each alert's severity is displayed using the shared severity badge style instead of a plain colored label

#### Scenario: Empty cattle list shows empty state
- **WHEN** an authenticated administrator opens the desktop cattle screen and no cattle records are returned
- **THEN** the screen displays the shared empty-state view instead of a blank list area

### Requirement: Desktop login visual presentation
The desktop login screen SHALL present the sign-in form as a centered, branded card using the shared desktop UI design system, with the shared error-brush styling for login error messages.

#### Scenario: Login form renders as a branded card
- **WHEN** an unauthenticated user opens the desktop app
- **THEN** the sign-in form is displayed inside a centered card with consistent spacing from the shared design system

### Requirement: Desktop sync screen visual presentation
The desktop sync screen SHALL present pending sync items using the shared desktop UI design system, including status badges for queue item state, and SHALL display the shared empty-state view when there are no pending sync items.

#### Scenario: Empty sync queue shows empty state
- **WHEN** an authenticated administrator opens the desktop sync screen and there are no pending sync items
- **THEN** the screen displays the shared empty-state view instead of a blank list area
