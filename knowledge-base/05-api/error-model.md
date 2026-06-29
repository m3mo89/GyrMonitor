---
title: API Error Model
area: api
version: 0.5.0
status: approved
owner: backend
last_updated: 2026-06-26
---

# API Error Model

## Purpose

This document defines the standard error response and error code catalog for the GyrMonitor API.

## Standard Error Envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [
      {
        "field": "cattleId",
        "message": "cattleId is required"
      }
    ]
  },
  "meta": {
    "requestId": "req-123",
    "timestamp": "2026-06-20T12:00:00Z"
  }
}
```

## Error Catalog

| Code | HTTP | Description |
|---|---:|---|
| `VALIDATION_ERROR` | 400 | Request contains invalid fields. |
| `UNAUTHORIZED` | 401 | Token is missing, invalid or expired. |
| `FORBIDDEN` | 403 | Authenticated user does not have permission. |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource does not exist. |
| `CONFLICT` | 409 | State or uniqueness conflict. |
| `IDEMPOTENCY_CONFLICT` | 409 | Idempotency key reused with a different payload. |
| `SYNC_PARTIAL_FAILURE` | 207 | Synchronization partially succeeded. |
| `INTERNAL_ERROR` | 500 | Unhandled server error. |

## Error Handling Rules

- Do not expose stack traces to clients.
- Validation details may include field-level information.
- Security errors must not reveal sensitive information.
- Every error response must include `requestId` for traceability.
- Frontend must map technical errors to user-friendly messages.

## References

- `05-api/conventions.md`
- `06-engineering/frontend/overview.md`
- `04-architecture/observability.md`
