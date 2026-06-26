---
title: Phase 2 - Authentication
section: 10-roadmap
status: approved
version: 0.9.0
---

# Phase 2: Authentication

## Goal

Implement the authentication foundation required by the rest of the MVP.

## Scope

- User entity.
- Role definitions.
- JWT login endpoint.
- Password hashing.
- Authentication guard.
- Role guard.
- Frontend login page.
- Token handling in HTTP clients.

## Related Documentation

- `05-api/authentication.md`
- `07-reference/roles-and-permissions.md`
- `07-reference/dto-catalog.md`
- `06-engineering/backend/`
- `06-engineering/frontend/`

## OpenSpec Change

```text
add-authentication
```

## Acceptance Criteria

- User can log in with valid credentials.
- Invalid credentials return a standardized error.
- Protected endpoints require JWT.
- Role-based authorization can be reused by other modules.
- Frontend can store session state according to documented security rules.

