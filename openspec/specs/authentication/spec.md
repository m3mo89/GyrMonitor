# Authentication Specification

## Purpose

Define the authentication foundation for GyrMonitor, including JWT login, user identity, reusable backend authentication and role authorization primitives, and frontend session handling.

## Requirements

### Requirement: User identity model
The backend SHALL provide a user identity model for authentication that includes a stable user id, name, email, role, and hashed password storage while never returning password material through API responses.

#### Scenario: Authenticated user omits password data
- **WHEN** login succeeds and the API returns the authenticated user summary
- **THEN** the response includes only the documented authenticated user fields and excludes password hashes, raw passwords, and password metadata

#### Scenario: Roles use approved values
- **WHEN** a user identity is created or loaded for authentication
- **THEN** the user role matches one of the roles documented in `knowledge-base/07-reference/roles-and-permissions.md`

### Requirement: Login endpoint
The backend SHALL expose `POST /api/v1/auth/login` as a public endpoint that accepts the documented login request DTO and returns the documented login response DTO on valid credentials.

#### Scenario: Successful login returns access token
- **WHEN** a user submits valid login credentials
- **THEN** the API returns a successful response containing `accessToken`, `expiresIn`, and the authenticated user summary

#### Scenario: Invalid credentials return standardized error
- **WHEN** a user submits an unknown email or invalid password
- **THEN** the API returns a standardized `UNAUTHORIZED` error response without revealing whether the email exists

#### Scenario: Login request validation fails
- **WHEN** the login request is missing required email or password fields
- **THEN** the API returns a standardized validation error response

### Requirement: JWT authentication guard
The backend SHALL provide a reusable authentication guard that requires a valid JWT bearer token for protected endpoints.

#### Scenario: Protected endpoint rejects missing token
- **WHEN** a request is made to a protected endpoint without an `Authorization: Bearer <token>` header
- **THEN** the API returns `UNAUTHORIZED`

#### Scenario: Protected endpoint rejects invalid or expired token
- **WHEN** a request is made to a protected endpoint with an invalid or expired token
- **THEN** the API returns `UNAUTHORIZED`

#### Scenario: Protected endpoint accepts valid token
- **WHEN** a request is made to a protected endpoint with a valid JWT bearer token
- **THEN** the request is allowed to continue with authenticated user identity and role claims available to the endpoint

### Requirement: Role authorization guard
The backend SHALL provide reusable role-based authorization primitives that allow protected endpoints to declare approved roles using the documented role matrix.

#### Scenario: Role guard allows permitted role
- **WHEN** an authenticated user accesses an endpoint that allows the user's role
- **THEN** the request is allowed to continue

#### Scenario: Role guard rejects forbidden role
- **WHEN** an authenticated user accesses an endpoint that does not allow the user's role
- **THEN** the API returns `FORBIDDEN`

### Requirement: Frontend login workflow
The frontend SHALL provide a login workflow that authenticates users through the documented login endpoint and stores only the session state needed for protected web workflows.

#### Scenario: User logs in from frontend
- **WHEN** a user submits valid credentials on the login page
- **THEN** the frontend stores the access token and authenticated user summary according to the session strategy and navigates to the protected application area

#### Scenario: Frontend displays login failure
- **WHEN** the login endpoint returns `UNAUTHORIZED` or validation errors
- **THEN** the frontend shows a user-friendly failure state without exposing technical details or retaining the submitted password

### Requirement: Frontend protected routes
The frontend SHALL protect private routes, redirect unauthenticated users to `/login`, and show an access-denied state for authenticated users whose role is not allowed for a route.

#### Scenario: Unauthenticated user visits protected route
- **WHEN** an unauthenticated user navigates to a protected route
- **THEN** the frontend redirects the user to `/login`

#### Scenario: Authenticated user lacks route role
- **WHEN** an authenticated user navigates to a route that does not allow the user's role
- **THEN** the frontend shows an access-denied state

#### Scenario: Expired session clears state
- **WHEN** the frontend detects an expired session or receives `UNAUTHORIZED` from a protected API call
- **THEN** the frontend clears session state and redirects the user to `/login`

### Requirement: HTTP client token handling
The frontend SHALL centralize API token handling so authenticated requests include `Authorization: Bearer <token>` and session cleanup is handled consistently.

#### Scenario: Authenticated request includes bearer token
- **WHEN** the frontend sends an API request after login
- **THEN** the shared HTTP client includes the access token in the `Authorization` header

#### Scenario: Logout clears token
- **WHEN** the user logs out
- **THEN** the frontend removes the stored token and authenticated user state before returning to the public login state
