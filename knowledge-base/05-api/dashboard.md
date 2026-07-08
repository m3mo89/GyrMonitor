---
title: Dashboard API
area: api
domain_module: dashboard
version: 0.5.0
status: approved
owner: backend
last_updated: 2026-06-26
---

# Dashboard API

## Purpose

The dashboard API exposes aggregated operational indicators for administrators and researchers.

## Related Requirements

| ID | Requirement |
| --- | --- |
| RF-15 | Show general metrics. |
| RF-16 | Show historical trends. |
| RF-17 | Show risk ranking. |
| RU-01 | Administrator can consult general dashboard. |
| RU-09 | Researcher can consult historical trends. |

## GET /dashboard

Returns global dashboard metrics.

| Field | Value |
| --- | --- |
| Method | `GET` |
| Route | `/api/v1/dashboard` |
| Use Case | `GetDashboardMetricsUseCase` |
| Roles | `ADMIN`, `RESEARCHER` |

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | ---: | --- |
| `from` | ISO Date | No | Start date for the period. |
| `to` | ISO Date | No | End date for the period. |
| `corralId` | UUID | No | Future filter by corral. |

### Response 200

```json
{
  "success": true,
  "data": {
    "totalCattle": 100,
    "activeAlerts": 7,
    "averageRiskScore": 42.5,
    "highRiskCattle": 3,
    "eventsToday": 144000,
    "syncPendingCount": 12,
    "riskRanking": [
      {
        "cattleId": "uuid",
        "tagNumber": "GYR-023",
        "riskScore": 87.5
      }
    ],
    "trend": [
      {
        "date": "2026-06-20",
        "events": 144000,
        "alerts": 7
      }
    ]
  }
}
```

## Business Rules

- Dashboard metrics are read-only.
- The frontend must not calculate critical business metrics.
- Aggregation logic belongs in backend use cases or query services.
- Dashboard should respond in less than 3 seconds for typical MVP queries.

## Impact Analysis

Dashboard depends on:

- Cattle.
- Activity Events.
- Risk Analysis.
- Alerts.
- Offline Sync status.

## Evolution

Future versions may add:

- Cached dashboard projections.
- Read replicas.
- Time-series optimized storage.
- Corral/location filters.
- Exportable reports.


## References

- `02-domain/domain-model.md`
- `03-requirements/functional-requirements.md`
- `03-requirements/business-rules.md`
- `04-architecture/security-architecture.md`
- `04-architecture/sync-architecture.md`
