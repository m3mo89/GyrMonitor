## MODIFIED Requirements

### Requirement: Frontend protected routes
The frontend SHALL protect private routes, redirect unauthenticated users to `/login`, show an access-denied state for authenticated users whose role is not allowed for a route, and show a role-specific integration-account message for authenticated `SYSTEM_GENERATOR` users who reach the web app without an allowed human-facing route.

#### Scenario: Unauthenticated user visits protected route
- **WHEN** an unauthenticated user navigates to a protected route
- **THEN** the frontend redirects the user to `/login`

#### Scenario: Authenticated user lacks route role
- **WHEN** an authenticated user navigates to a route that does not allow the user's role
- **THEN** the frontend shows an access-denied state

#### Scenario: System generator logs into web app
- **WHEN** an authenticated `SYSTEM_GENERATOR` reaches the web app after login
- **THEN** the frontend shows a dedicated message explaining that the account is intended for event ingestion from simulator, desktop client, or controlled test data rather than dashboard, cattle, or alert review

#### Scenario: System generator message offers next action
- **WHEN** the frontend shows the `SYSTEM_GENERATOR` integration-account message
- **THEN** the message provides a clear next action to log out or switch to an operational account

#### Scenario: Expired session clears state
- **WHEN** the frontend detects an expired session or receives `UNAUTHORIZED` from a protected API call
- **THEN** the frontend clears session state and redirects the user to `/login`
