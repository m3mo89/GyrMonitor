## ADDED Requirements

### Requirement: Command-line admin bootstrap

The backend SHALL provide a command-line script that creates a single ADMIN user from environment-supplied credentials, using the same validation, role assignment, and password hashing as the admin-only user creation endpoint, so an environment with no existing ADMIN can be bootstrapped without direct database manipulation.

#### Scenario: Operator bootstraps the first admin

- **WHEN** an operator runs the create-admin script with `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables set and no user exists with that email
- **THEN** the script creates a user with `ADMIN` role and `ACTIVE` status whose password matches the same hash format used by the login flow

#### Scenario: Missing required credentials are rejected

- **WHEN** an operator runs the create-admin script without `ADMIN_EMAIL` or without `ADMIN_PASSWORD` set
- **THEN** the script exits with a non-zero status and a message identifying the missing environment variable, without attempting a database write

#### Scenario: Duplicate email is rejected

- **WHEN** an operator runs the create-admin script with an `ADMIN_EMAIL` that already belongs to an existing user
- **THEN** the script exits with a non-zero status and a message indicating the email already exists, without creating a duplicate or modifying the existing user

#### Scenario: Weak password is rejected

- **WHEN** an operator runs the create-admin script with an `ADMIN_PASSWORD` shorter than the minimum password length enforced by user creation
- **THEN** the script exits with a non-zero status and a message describing the minimum length, without creating a user
