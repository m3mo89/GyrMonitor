---
title: Activity Events API
area: api
domain_module: activity-events
version: 0.5.0
status: approved
owner: backend
last_updated: 2026-06-26
---

# Activity Events API

## Purpose

Activity events represent observed activity or inactivity for cattle. They are the input for risk analysis and alert generation.

## Related Requirements

| ID | Requirement |
| --- | --- |
| RF-04 | Register activity events. |
| RF-05 | Register inactivity events. |
| RF-06 | Consult event history. |
| RF-07 | Calculate risk index. |
| RF-10 | Generate alerts. |
| RN-01 | Identify prolonged inactivity early. |
| RN-06 | Avoid duplicate events during synchronization retries. |

## POST /events

Registers an activity or inactivity event. This endpoint may trigger risk calculation and alert generation.

| Field | Value |
| --- | --- |
| Method | `POST` |
| Route | `/api/v1/events` |
| Use Case | `RegisterActivityEventUseCase` |
| Roles | `SYSTEM_GENERATOR`, `ADMIN` |
| Idempotency | Recommended through `eventId` or `Idempotency-Key` |

### Request

```json
{
  "eventId": "uuid",
  "deviceId": "SIM-001",
  "cattleId": "uuid",
  "eventType": "INACTIVITY",
  "inactiveMinutes": 95,
  "confidence": 0.87,
  "capturedAt": "2026-06-20T12:30:00Z",
  "source": "DESKTOP_SIMULATOR"
}
```

### Response 201

```json
{
  "success": true,
  "data": {
    "eventId": "uuid",
    "riskScore": 78.5,
    "severity": "HIGH",
    "alertGenerated": true,
    "alertId": "uuid"
  }
}
```

## GET /events

Returns events using optional filters.

| Field | Value |
| --- | --- |
| Method | `GET` |
| Route | `/api/v1/events` |
| Use Case | `GetActivityEventsUseCase` |
| Roles | `ADMIN`, `RESEARCHER` |

### Common Query Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `cattleId` | UUID | Filter by cattle. |
| `eventType` | `ACTIVITY` \| `INACTIVITY` | Filter by event type. |
| `from` | ISO Date | Start date. |
| `to` | ISO Date | End date. |
| `page` | integer | Page number. |
| `pageSize` | integer | Page size. |

## Business Rules

- If `eventType = INACTIVITY`, backend calculates `riskScore`.
- If `inactiveMinutes` exceeds the configured threshold, an alert is generated.
- If `eventId` already exists, backend must not duplicate the event.
- `capturedAt` represents field capture time, not synchronization time.
- The event source must be recorded for auditability and troubleshooting.

## Impact Analysis

Activity Events affect:

- Risk Analysis.
- Alerts.
- Dashboard.
- Offline Sync.
- Cattle history.


## References

- `02-domain/domain-model.md`
- `03-requirements/functional-requirements.md`
- `03-requirements/business-rules.md`
- `04-architecture/security-architecture.md`
- `04-architecture/sync-architecture.md`
