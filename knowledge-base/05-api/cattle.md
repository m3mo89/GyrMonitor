---
title: Cattle API
area: api
domain_module: cattle-monitoring
version: 0.5.0
status: approved
owner: backend
last_updated: 2026-06-26
---

# Cattle API

## Purpose

The cattle API exposes cattle records and associated historical activity information.

## Related Requirements

| ID | Requirement |
| --- | --- |
| RF-01 | Register cattle. |
| RF-02 | Consult cattle. |
| RF-03 | Consult cattle history. |
| RU-03 | Administrator can consult event history by cattle. |
| RU-04 | Administrator can view cattle risk ranking. |

## GET /cattle

Lists cattle registered in the system.

| Field | Value |
| --- | --- |
| Method | `GET` |
| Route | `/api/v1/cattle` |
| Use Case | `GetCattleListUseCase` |
| Roles | `ADMIN`, `RESEARCHER` |

### Response 200

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tagNumber": "GYR-023",
      "breed": "Gyr",
      "sex": "FEMALE",
      "status": "ACTIVE",
      "lastRiskScore": 87.5
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

## GET /cattle/{id}

Returns details for a specific cattle record.

| Field | Value |
| --- | --- |
| Method | `GET` |
| Route | `/api/v1/cattle/{id}` |
| Use Case | `GetCattleByIdUseCase` |
| Roles | `ADMIN`, `RESEARCHER` |

## GET /cattle/{id}/events

Returns historical activity events for a specific cattle record.

| Field | Value |
| --- | --- |
| Method | `GET` |
| Route | `/api/v1/cattle/{id}/events` |
| Use Case | `GetCattleHistoryUseCase` |
| Roles | `ADMIN`, `RESEARCHER` |

## Business Rules

- Every activity event must be associated with an existing cattle record.
- Cattle history may include events, alerts and observations.
- `tagNumber` must be human-readable and useful for field identification.
- MVP is expected to support at least 100 cattle.

## Impact Analysis

Cattle affects:

- Activity Events.
- Risk Analysis.
- Alerts.
- Dashboard.
- Offline Sync.


## References

- `02-domain/domain-model.md`
- `03-requirements/functional-requirements.md`
- `03-requirements/business-rules.md`
- `04-architecture/security-architecture.md`
- `04-architecture/sync-architecture.md`
