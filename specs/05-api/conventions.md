---
title: API Conventions
area: api
version: 0.5.0
status: approved
owner: backend
last_updated: 2026-06-26
---

# API Conventions

## Purpose

This document defines API conventions that must be followed by all GyrMonitor endpoints.

## Base URL

| Environment | URL |
|---|---|
| Local | `http://localhost:3000/api/v1` |
| Production placeholder | `https://api.gyrmonitor.example.com/api/v1` |

## Common Headers

| Header | Required | Description |
|---|---:|---|
| `Authorization: Bearer <token>` | Yes, except public endpoints | JWT access token. |
| `Content-Type: application/json` | Yes for requests with body | Request body format. |
| `Accept: application/json` | Yes | Expected response format. |
| `Idempotency-Key` | Required for sync and critical POST operations | Prevents duplicate processing during retries. |
| `X-Client-Id` | Recommended | Logical client identifier for web, mobile, desktop or simulator clients. |

## Naming Rules

| Element | Convention | Example |
|---|---|---|
| Routes | plural kebab-case | `/activity-events` |
| JSON fields | camelCase | `inactiveMinutes` |
| IDs | UUID | `2b7c0f3e-7d89-4a4b-9c0e-1d35f0b1f7a1` |
| Dates | ISO-8601 UTC | `2026-06-20T12:00:00Z` |
| Status values | UPPER_SNAKE_CASE | `PENDING` |
| Error codes | UPPER_SNAKE_CASE | `VALIDATION_ERROR` |

## Standard Success Response

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req-123",
    "timestamp": "2026-06-20T12:00:00Z"
  }
}
```

## Standard Error Response

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

## Pagination

List endpoints should support pagination when result size can grow.

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

## Date Handling

- Backend stores timestamps in UTC.
- Clients may convert timestamps to local display time.
- `capturedAt` represents field capture time, not server synchronization time.

## Idempotency

Idempotency is required for synchronization endpoints and recommended for event/observation creation.

Rules:

- Same key + same payload returns the previous successful result.
- Same key + different payload returns `IDEMPOTENCY_CONFLICT`.
- Idempotency records must include client identity when available.

## References

- `06-api/error-model.md`
- `06-api/offline-sync.md`
- `04-architecture/sync-architecture.md`
