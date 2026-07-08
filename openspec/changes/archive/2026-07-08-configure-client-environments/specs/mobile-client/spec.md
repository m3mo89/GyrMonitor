## ADDED Requirements

### Requirement: Mobile login environment selection, hidden once on Production

The mobile client SHALL let a field operator choose the backend environment (Local/Development, Staging, or Production) from the login screen before signing in, using the shared client core's runtime-selectable API environment, and SHALL hide that picker whenever the current environment is Production.

#### Scenario: Login screen offers all three environments while not on Production

- **WHEN** the mobile login screen loads and the current environment is Local/Development or Staging
- **THEN** it presents Local/Development, Staging, and Production as selectable environment options

#### Scenario: Selecting an environment updates where login is sent

- **WHEN** a field operator selects Staging or Production on the login screen and then submits valid credentials
- **THEN** the login request is sent to the selected environment's backend, not the previous or default environment

#### Scenario: Selecting Production hides the picker

- **WHEN** a field operator selects Production on the login screen
- **THEN** the environment picker is no longer rendered, and there is no in-app control to switch back to Local/Development or Staging

#### Scenario: Release build starts on Production with no picker shown

- **WHEN** the mobile login screen loads in a Release build with no previously persisted environment
- **THEN** the current environment is already Production and no environment picker is rendered

#### Scenario: Environment selection is disabled while signing in

- **WHEN** a login attempt is in progress and the picker is currently visible
- **THEN** the environment picker is disabled until the attempt completes

#### Scenario: Environment selection is not exposed after authentication

- **WHEN** a field operator is authenticated and inside the mobile workflow
- **THEN** no control is exposed there to change the API environment; changing environments (while still possible, i.e. not on Production) requires returning to the login screen

#### Scenario: Local/Development default still resolves per platform

- **WHEN** the mobile login screen defaults to Local/Development on Android
- **THEN** it resolves to the Android emulator loopback address, matching existing mobile connectivity behavior

### Requirement: Mobile logout

The mobile client SHALL let an authenticated field operator end their session and return to the login screen from any authenticated page.

#### Scenario: Field operator logs out from the workflow

- **WHEN** a field operator selects the logout action from any authenticated tab (Alerts or Sync) or the alert detail/observation capture pages
- **THEN** the app clears the persisted session and navigates to the login screen

#### Scenario: Logged-out session cannot make authenticated requests

- **WHEN** a field operator logs out
- **THEN** the cleared session is no longer attached to subsequent API requests, matching how an expired-session sign-out already behaves

#### Scenario: Login screen after logout reflects the current environment rule

- **WHEN** a field operator logs out
- **THEN** the login screen shown afterward follows the same environment-picker visibility rule as any other login screen load (visible unless the current environment is Production)
