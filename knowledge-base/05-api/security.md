---
title: API Security
area: api
version: 0.5.0
status: approved
owner: backend
last_updated: 2026-06-26
---

# API Security

## Purpose

This document defines security expectations for API contracts.

## Authentication

All protected endpoints require JWT Bearer tokens.

```http
Authorization: Bearer <token>
```

## Authorization

Role-based authorization must be enforced before use case execution.

| Module | Roles |
| --- | --- |
| Authentication | Public login. |
| Dashboard | `ADMIN`, `RESEARCHER` |
| Cattle | `ADMIN`, `RESEARCHER` |
| Activity Events | `SYSTEM_GENERATOR`, `ADMIN` |
| Alerts | `ADMIN`, `FIELD_OPERATOR`, `RESEARCHER` |
| Observations | `FIELD_OPERATOR`, `ADMIN` |
| Offline Sync | `FIELD_OPERATOR`, `SYSTEM_GENERATOR`, `ADMIN` |

## Transport Security

Production traffic must use HTTPS.

## Sensitive Data Rules

- Never return password hashes.
- Do not log raw credentials.
- Do not expose stack traces in API responses.
- Avoid logging sensitive user data in frontend or backend telemetry.

## Token Handling

- Clients must attach the token using the `Authorization` header.
- Expired tokens return `UNAUTHORIZED`.
- Missing permissions return `FORBIDDEN`.

## Security Evolution

Future versions may add:

- Refresh tokens.
- Role/permission granularity.
- Authorization for trusted system generators.
- API key support for trusted system generators.
- Audit logs for administrative actions.

## References

- `04-architecture/security-architecture.md`
- `05-api/authentication.md`
- `05-api/error-model.md`
