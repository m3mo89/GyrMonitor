---
title: HTTP Status Reference
section: 07-reference
status: approved
version: 0.7.0
---

# HTTP Status Reference

| Status | Name | Used For |
| ---: | --- | --- |
| 200 | OK | Successful GET, PATCH and sync batch responses. |
| 201 | Created | Successful POST creating a new event, alert-related observation or resource. |
| 207 | Multi-Status | Partial success in synchronization batches. |
| 400 | Bad Request | Validation errors. |
| 401 | Unauthorized | Missing, invalid or expired JWT. |
| 403 | Forbidden | Valid token but insufficient role. |
| 404 | Not Found | Missing cattle, event, alert or observation. |
| 409 | Conflict | State conflicts, duplicate resources or idempotency conflicts. |
| 500 | Internal Server Error | Unexpected server failure. |

## Recommendations

- Use `201` only when a new server-side resource is created.
- Use `200` for idempotent duplicate acceptance when the payload matches the original request.
- Use `409 IDEMPOTENCY_CONFLICT` when a key is reused with a different payload.
- Use `207 SYNC_PARTIAL_FAILURE` when a batch contains both successful and failed items.
