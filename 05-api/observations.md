---
title: Observations API
area: api
domain_module: observations
version: 0.5.0
status: approved
owner: backend
last_updated: 2026-06-26
---

# Observations API

## Purpose

Observations document field inspections performed in response to alerts.

## Related Requirements

| ID | Requirement |
|---|---|
| RF-13 | Register observations. |
| RF-14 | Consult observations. |
| RN-08 | Maintain traceability between event, alert, observation and user. |
| HU-07 | Field operator can register observations. |

## POST /alerts/{id}/observations

Registers an observation associated with an alert.

| Field | Value |
|---|---|
| Method | `POST` |
| Route | `/api/v1/alerts/{id}/observations` |
| Use Case | `AddAlertObservationUseCase` |
| Roles | `FIELD_OPERATOR`, `ADMIN` |
| Idempotency | Recommended for offline clients |

### Request

```json
{
  "observationId": "uuid",
  "comment": "El animal fue revisado. Se observó baja movilidad.",
  "createdAt": "2026-06-20T13:00:00Z",
  "clientId": "MOBILE-001"
}
```

### Response 201

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "alertId": "uuid",
    "userId": "uuid",
    "comment": "El animal fue revisado. Se observó baja movilidad.",
    "createdAt": "2026-06-20T13:00:00Z"
  }
}
```

## Business Rules

- Observation must belong to an existing alert.
- Observation must include user identity.
- Observation must include creation timestamp.
- Offline-created observations must preserve original creation time.
- Duplicate observations caused by retry must be avoided with idempotency.

## Impact Analysis

Observations affect:

- Alert traceability.
- Field inspection workflow.
- Dashboard context.
- Offline Sync.


## References

- `02-domain/domain-model.md`
- `03-requirements/functional-requirements.md`
- `03-requirements/business-rules.md`
- `04-architecture/security-architecture.md`
- `04-architecture/sync-architecture.md`
