## MODIFIED Requirements

### Requirement: User identity model

The backend SHALL provide a user identity model for authentication that includes a stable user id, name, email, role, account status (`ACTIVE` or `DISABLED`), and hashed password storage while never returning password material through API responses.

#### Scenario: Authenticated user omits password data

- **WHEN** login succeeds and the API returns the authenticated user summary
- **THEN** the response includes only the documented authenticated user fields and excludes password hashes, raw passwords, and password metadata

#### Scenario: Roles use approved values

- **WHEN** a user identity is created or loaded for authentication
- **THEN** the user role matches one of the roles documented in `knowledge-base/07-reference/roles-and-permissions.md`

#### Scenario: New users default to active status

- **WHEN** a user identity is created without an explicit status
- **THEN** the user's status is `ACTIVE`

### Requirement: Login endpoint

The backend SHALL expose `POST /api/v1/auth/login` as a public endpoint that accepts the documented login request DTO and returns the documented login response DTO on valid credentials for an `ACTIVE` user.

#### Scenario: Successful login returns access token

- **WHEN** a user submits valid login credentials
- **THEN** the API returns a successful response containing `accessToken`, `expiresIn`, and the authenticated user summary

#### Scenario: Invalid credentials return standardized error

- **WHEN** a user submits an unknown email or invalid password
- **THEN** the API returns a standardized `UNAUTHORIZED` error response without revealing whether the email exists

#### Scenario: Login request validation fails

- **WHEN** the login request is missing required email or password fields
- **THEN** the API returns a standardized validation error response

#### Scenario: Disabled user cannot log in

- **WHEN** a user submits valid credentials for a `DISABLED` user
- **THEN** the API returns the same standardized `UNAUTHORIZED` error response used for invalid credentials, without revealing that the account is disabled
