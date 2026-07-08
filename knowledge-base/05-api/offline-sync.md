---
title: Offline Sync API
area: api
domain_module: offline-sync
version: 0.5.0
status: approved
owner: backend
last_updated: 2026-06-26
---

# Offline Sync API

## Purpose

Offline Sync allows mobile and desktop clients to store operations locally and synchronize them when connectivity returns.

## Related Requirements

| ID | Requirement |
| --- | --- |
| RF-18 | Persist information locally. |
| RF-19 | Maintain synchronization queue. |
| RF-20 | Synchronize pending events. |
| RF-21 | Synchronize pending observations. |
| RF-22 | Detect synchronization conflicts. |
| RF-23 | Apply idempotency. |
| RN-04 | Operate under intermittent connectivity. |
| RN-05 | Synchronize offline information automatically. |
| RN-06 | Avoid duplicate events during retry. |

## POST /sync/events

Synchronizes locally captured events.

| Field | Value |
| --- | --- |
| Method | `POST` |
| Route | `/api/v1/sync/events` |
| Use Case | `SyncEventsUseCase` |
| Roles | `FIELD_OPERATOR`, `SYSTEM_GENERATOR`, `ADMIN` |
| Idempotency-Key | Required |

### Request

```json
{
  "clientId": "MOBILE-001",
  "deviceId": "DEVICE-001",
  "items": [
    {
      "localId": "local-uuid",
      "eventId": "uuid",
      "cattleId": "uuid",
      "eventType": "INACTIVITY",
      "inactiveMinutes": 80,
      "confidence": 0.85,
      "capturedAt": "2026-06-20T12:00:00Z",
      "source": "MOBILE_CLIENT"
    }
  ]
}
```

### Response 200

```json
{
  "success": true,
  "data": {
    "processed": 1,
    "created": 1,
    "duplicates": 0,
    "failed": 0,
    "results": [
      {
        "localId": "local-uuid",
        "eventId": "uuid",
        "status": "SYNCED",
        "serverId": "uuid"
      }
    ]
  }
}
```

## POST /sync/observations

Synchronizes locally registered observations.

| Field | Value |
| --- | --- |
| Method | `POST` |
| Route | `/api/v1/sync/observations` |
| Use Case | `SyncObservationsUseCase` |
| Roles | `FIELD_OPERATOR`, `ADMIN` |
| Idempotency-Key | Required |

### Request

```json
{
  "clientId": "MOBILE-001",
  "items": [
    {
      "localId": "local-uuid",
      "observationId": "uuid",
      "alertId": "uuid",
      "comment": "Observación registrada en campo sin conexión.",
      "createdAt": "2026-06-20T13:00:00Z"
    }
  ]
}
```

## GET /sync/status

Returns synchronization status for a client/device.

| Field | Value |
| --- | --- |
| Method | `GET` |
| Route | `/api/v1/sync/status` |
| Use Case | `GetSyncStatusUseCase` |
| Roles | `FIELD_OPERATOR`, `ADMIN` |

## Business Rules

- Sync operations must be idempotent.
- The backend must not duplicate events or observations during retries.
- Partial synchronization failures must report item-level results.
- Clients should mark local queue items as synchronized only after successful server confirmation.
- Server must preserve original capture/creation timestamps from offline clients.
- Event source must be preserved for synchronized activity events.

## Failure Handling

| Condition | Expected Behavior |
| --- | --- |
| Duplicate event | Return duplicate result, do not create new event. |
| Invalid cattleId | Mark item as failed. |
| Invalid alertId | Mark observation as failed. |
| Same idempotency key with different payload | Return `IDEMPOTENCY_CONFLICT`. |
| Some items fail | Return partial success semantics. |

## Impact Analysis

Offline Sync affects:

- Activity Events.
- Observations.
- Alerts.
- Dashboard sync indicators.
- Field operations.


## References

- `02-domain/domain-model.md`
- `03-requirements/functional-requirements.md`
- `03-requirements/business-rules.md`
- `04-architecture/security-architecture.md`
- `04-architecture/sync-architecture.md`
