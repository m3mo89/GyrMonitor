---
title: Observability
area: architecture
version: 0.1
status: approved
owner: architecture
source_documents:
  - DOC-01_GyrMonitor_V2_Academico
  - DOC-03_GyrMonitor_Contratos_Backend_V2_Academico
---

# Observability

## Purpose

This document defines how GyrMonitor should expose operational visibility for debugging, support and academic evaluation.

## Observability Goals

- Trace synchronization attempts.
- Identify API errors.
- Understand event-to-alert flow.
- Support debugging of offline behavior.
- Avoid logging sensitive data.

## What to Observe

| Area | Signals |
|---|---|
| API | Request ID, endpoint, status code, latency, error code. |
| Sync | Client ID, entity type, processed count, duplicates, failures. |
| Events | Event registration result, risk score, alert generated flag. |
| Alerts | Status changes, attended timestamp, user. |
| Frontend | API failures, route errors, stale data state. |
| Mobile/Desktop | Local queue size, failed sync count, last sync timestamp. |

## Request Correlation

Every API response should include metadata similar to:

```json
{
  "meta": {
    "requestId": "req-123",
    "timestamp": "2026-06-20T12:00:00Z"
  }
}
```

## Sync Logs

The backend should maintain sync logs for:

- device ID;
- client ID;
- entity type;
- entity ID;
- sync status;
- timestamp;
- failure reason when available.

## Logging Levels

| Level | Usage |
|---|---|
| DEBUG | Local development details. |
| INFO | Successful important operations. |
| WARN | Retryable failures or stale data. |
| ERROR | Failed operations requiring investigation. |

## Sensitive Data Rule

Do not log passwords, raw JWTs or unnecessary personally identifiable information.

## MVP Approach

For MVP, structured logs and consistent API error models are sufficient. Full monitoring tools can be introduced later.
