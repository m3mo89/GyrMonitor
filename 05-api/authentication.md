---
title: Authentication API
area: api
domain_module: authentication
version: 0.5.0
status: approved
owner: backend
last_updated: 2026-06-26
---

# Authentication API

## Purpose

Authentication allows users and system clients to access protected GyrMonitor resources using JWT Bearer tokens.

## Related Requirements

| ID | Requirement |
|---|---|
| RNF-04 | Authentication using JWT. |
| RNF-05 | Communication through secure channels. |
| RU-01 | Administrator can consult the dashboard. |
| RU-05 | Field operator can consult pending alerts from mobile. |

## Roles

| Role | Main Permissions |
|---|---|
| `ADMIN` | Manage users, cattle, dashboard, events, alerts and observations. |
| `FIELD_OPERATOR` | View alerts, register observations, attend alerts and synchronize offline records. |
| `RESEARCHER` | View dashboard, trends and historical information. |
| `SYSTEM_GENERATOR` | Register activity/inactivity events. |

## POST /auth/login

Authenticates a user and returns a JWT access token.

| Field | Value |
|---|---|
| Method | `POST` |
| Route | `/api/v1/auth/login` |
| Use Case | `LoginUseCase` |
| Authentication | Public |
| Roles | `ADMIN`, `FIELD_OPERATOR`, `RESEARCHER` |

### Request

```json
{
  "email": "admin@gyrmonitor.local",
  "password": "********"
}
```

### Response 200

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "name": "Administrador",
      "email": "admin@gyrmonitor.local",
      "role": "ADMIN"
    }
  }
}
```

## Protected Resources

All endpoints except `POST /auth/login` and optional health endpoints require JWT.

```http
Authorization: Bearer <token>
```

## Business Rules

- Passwords must never be returned by the API.
- Tokens must include user identity and role claims.
- Expired or invalid tokens must return `UNAUTHORIZED`.
- Authenticated users may still receive `FORBIDDEN` when their role does not allow the operation.

## Impact Analysis

Authentication affects every module that exposes protected resources:

- Dashboard.
- Cattle Monitoring.
- Activity Events.
- Alerts.
- Observations.
- Offline Sync.


## References

- `02-domain/domain-model.md`
- `03-requirements/functional-requirements.md`
- `03-requirements/business-rules.md`
- `04-architecture/security-architecture.md`
- `04-architecture/sync-architecture.md`
