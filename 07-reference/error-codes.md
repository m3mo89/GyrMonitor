---
title: Error Codes
section: 07-reference
status: approved
version: 0.7.0
---

# Error Codes

Errors must use a stable machine-readable code and a user-safe message.

## Catalog

| Code | HTTP | Meaning | Typical Resolution |
|---|---:|---|---|
| `VALIDATION_ERROR` | 400 | Request fields are missing or invalid. | Fix input DTO and retry. |
| `UNAUTHORIZED` | 401 | Token missing, invalid or expired. | Re-authenticate. |
| `FORBIDDEN` | 403 | Authenticated user lacks permission. | Check role and authorization policy. |
| `RESOURCE_NOT_FOUND` | 404 | Resource does not exist. | Verify identifier. |
| `CONFLICT` | 409 | State conflict or duplicate resource. | Refresh state and retry if safe. |
| `IDEMPOTENCY_CONFLICT` | 409 | Same idempotency key used with different payload. | Generate a new key or inspect original request. |
| `SYNC_PARTIAL_FAILURE` | 207 | Some sync items failed. | Process item-level results and retry failed items. |
| `INTERNAL_ERROR` | 500 | Unexpected server error. | Log requestId and investigate. |

## Error Envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [
      { "field": "cattleId", "message": "cattleId is required" }
    ]
  },
  "meta": {
    "requestId": "req-123",
    "timestamp": "2026-06-20T12:00:00Z"
  }
}
```

## Rules

1. Do not expose stack traces to clients.
2. Always include `requestId` in error responses.
3. Use `details` only for actionable validation or item-level sync errors.
4. Frontend and mobile clients must map technical errors to user-safe messages.
5. Sync endpoints may return partial results instead of failing the whole batch.
