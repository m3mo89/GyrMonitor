---
title: User Management API
area: api
domain_module: user-management
version: 0.1.0
status: approved
owner: backend
last_updated: 2026-07-08
---

# User Management API

## Purpose

ADMIN-only management of user accounts: creating users, listing users, disabling/reactivating accounts, and resetting passwords. Complements `authentication.md`, which covers login and JWT/role guards.

## Related Requirements

Sourced from `openspec/specs/user-management/spec.md` (`admin-user-management`, `db-create-admin-script` archived changes).

## POST /users

Creates a new user.

| Field | Value |
| --- | --- |
| Method | `POST` |
| Route | `/api/v1/users` |
| Roles | `ADMIN` |

### Request

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "FIELD_OPERATOR",
  "password": "initial-password"
}
```

### Response 201

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "FIELD_OPERATOR",
    "status": "ACTIVE"
  }
}
```

Non-`ADMIN` callers receive `FORBIDDEN`. A duplicate email or an unapproved `role` value returns a standardized validation error and creates no user.

## GET /users

Lists every user.

| Field | Value |
| --- | --- |
| Method | `GET` |
| Route | `/api/v1/users` |
| Roles | `ADMIN` |

### Response 200

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com", "role": "FIELD_OPERATOR", "status": "ACTIVE" }
  ]
}
```

Password hashes, raw passwords, and password metadata are never included.

## POST /users/{id}/disable

Disables a user's login access without deleting the record.

| Field | Value |
| --- | --- |
| Method | `POST` |
| Route | `/api/v1/users/{id}/disable` |
| Roles | `ADMIN` |

An ADMIN cannot disable their own account; the API returns a standardized validation error and leaves the account unchanged.

## POST /users/{id}/reactivate

Reactivates a previously disabled user.

| Field | Value |
| --- | --- |
| Method | `POST` |
| Route | `/api/v1/users/{id}/reactivate` |
| Roles | `ADMIN` |

## POST /users/{id}/reset-password

Sets a new password for the target user.

| Field | Value |
| --- | --- |
| Method | `POST` |
| Route | `/api/v1/users/{id}/reset-password` |
| Roles | `ADMIN` |

### Request

```json
{ "newPassword": "new-strong-password" }
```

## Command-Line Admin Bootstrap

`backend/scripts/create-admin.mjs` (invoked via `npm run db:create-admin --workspace backend`) creates a single `ADMIN` user from `ADMIN_EMAIL`/`ADMIN_PASSWORD` environment variables, using the same validation, role assignment, and password hashing as `POST /users`. It exits non-zero without writing to the database if the environment variables are missing, the email already exists, or the password is weaker than the minimum enforced by user creation. This is the intended way to provision the first ADMIN in a fresh environment (see `backend/README.md`).

## Business Rules

- All endpoints require an authenticated `ADMIN`; every other role receives `FORBIDDEN`.
- Disable/reactivate never delete the user record, preserving audit/traceability.
- An ADMIN cannot disable their own account.

## Impact Analysis

User Management affects:

- Authentication (shares `Role`/`UserStatus` domain types).
- Frontend `user-management` feature (admin page).
- Deployment bootstrap (`db:create-admin`).

## References

- `openspec/specs/user-management/spec.md`
- `05-api/authentication.md`
- `07-reference/dto-catalog.md`
- `02-domain/module-dependency-map.md`
