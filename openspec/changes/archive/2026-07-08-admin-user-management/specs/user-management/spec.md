## ADDED Requirements

### Requirement: Admin-only user creation
The backend SHALL expose `POST /api/v1/users` as an ADMIN-only endpoint that creates a new user with a name, email, role, and initial password, and returns the created user's non-sensitive summary.

#### Scenario: Admin creates a user
- **WHEN** an authenticated ADMIN submits a valid name, unique email, approved role, and initial password
- **THEN** the API creates the user with `ACTIVE` status and returns the created user's id, name, email, role, and status, excluding password material

#### Scenario: Non-admin cannot create a user
- **WHEN** an authenticated user whose role is not `ADMIN` calls the create-user endpoint
- **THEN** the API returns `FORBIDDEN` and no user is created

#### Scenario: Duplicate email is rejected
- **WHEN** an ADMIN submits an email that already belongs to an existing user
- **THEN** the API returns a standardized validation error and no user is created

#### Scenario: Invalid role is rejected
- **WHEN** an ADMIN submits a role that is not one of the documented approved roles
- **THEN** the API returns a standardized validation error and no user is created

### Requirement: Admin-only user listing
The backend SHALL expose `GET /api/v1/users` as an ADMIN-only endpoint that returns every user's id, name, email, role, and status, excluding password material.

#### Scenario: Admin lists users
- **WHEN** an authenticated ADMIN calls the list-users endpoint
- **THEN** the API returns every user's id, name, email, role, and status, and excludes password hashes, raw passwords, and password metadata

#### Scenario: Non-admin cannot list users
- **WHEN** an authenticated user whose role is not `ADMIN` calls the list-users endpoint
- **THEN** the API returns `FORBIDDEN`

### Requirement: Admin-only user disable and reactivate
The backend SHALL expose `POST /api/v1/users/:id/disable` and `POST /api/v1/users/:id/reactivate` as ADMIN-only endpoints that change a user's status without deleting the user record, and SHALL prevent an ADMIN from disabling their own account.

#### Scenario: Admin disables a user
- **WHEN** an authenticated ADMIN disables another user's account
- **THEN** the user's status becomes `DISABLED` and the user record is not deleted

#### Scenario: Admin reactivates a disabled user
- **WHEN** an authenticated ADMIN reactivates a `DISABLED` user's account
- **THEN** the user's status becomes `ACTIVE`

#### Scenario: Admin cannot disable their own account
- **WHEN** an authenticated ADMIN attempts to disable the account they are currently authenticated as
- **THEN** the API returns a standardized validation error and the account's status is unchanged

#### Scenario: Non-admin cannot disable or reactivate a user
- **WHEN** an authenticated user whose role is not `ADMIN` calls the disable or reactivate endpoint
- **THEN** the API returns `FORBIDDEN` and the target user's status is unchanged

### Requirement: Admin-only password reset
The backend SHALL expose `POST /api/v1/users/:id/reset-password` as an ADMIN-only endpoint that sets a new password for the target user.

#### Scenario: Admin resets a user's password
- **WHEN** an authenticated ADMIN submits a valid new password for a target user
- **THEN** the target user's stored password hash is replaced and the previous password no longer authenticates

#### Scenario: Non-admin cannot reset a password
- **WHEN** an authenticated user whose role is not `ADMIN` calls the reset-password endpoint
- **THEN** the API returns `FORBIDDEN` and the target user's password is unchanged

### Requirement: Frontend user management page
The web frontend SHALL provide an ADMIN-only page that lists users with their role and status and lets the admin create, disable, reactivate, and reset the password of a user.

#### Scenario: Admin views the user management page
- **WHEN** an authenticated ADMIN navigates to the user management page
- **THEN** the page shows every user's name, email, role, and status

#### Scenario: Non-admin cannot reach the user management page
- **WHEN** an authenticated user whose role is not `ADMIN` navigates to the user management page route
- **THEN** the frontend shows an access-denied state instead of the page content

#### Scenario: Admin creates a user from the page
- **WHEN** an authenticated ADMIN submits the create-user form with valid data
- **THEN** the new user appears in the list with `ACTIVE` status without a full page reload

#### Scenario: Admin disables a user from the page
- **WHEN** an authenticated ADMIN uses the disable action on a listed user
- **THEN** that user's displayed status updates to `DISABLED` without a full page reload
