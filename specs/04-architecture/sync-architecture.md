---
title: Synchronization Architecture
area: architecture
version: 0.1
status: approved
owner: architecture
source_documents:
  - DOC-01_GyrMonitor_V2_Academico
  - DOC-03_GyrMonitor_Contratos_Backend_V2_Academico
---

# Synchronization Architecture

## Purpose

This document defines the architecture for eventual synchronization between local SQLite clients and the central backend.

## Pattern

GyrMonitor uses a **Store and Forward** pattern.

1. Client stores the operation locally.
2. Client records the operation in Sync Queue.
3. Client retries when connectivity is available.
4. Backend enforces idempotency.
5. Client updates local sync status.

## Sync Queue

| Field | Description |
|---|---|
| id | Queue item identifier. |
| entityType | Type of entity to synchronize. |
| entityId | Local or domain entity identifier. |
| operation | CREATE, UPDATE or future operation. |
| retryCount | Number of attempted syncs. |
| status | PENDING, SYNCING, SYNCED, FAILED, CONFLICT. |
| createdAt | Local queue creation timestamp. |

## Idempotency

Each critical sync request must include an `Idempotency-Key` header.

The backend must ensure that:

- Repeated requests with the same key and same payload do not create duplicates.
- Repeated requests with the same key but different payload return an idempotency conflict.
- Event-level identifiers such as `eventId` or `observationId` are also used to prevent duplication.

## Sync Endpoints

| Endpoint | Purpose |
|---|---|
| `POST /sync/events` | Synchronize offline activity events. |
| `POST /sync/observations` | Synchronize offline observations. |
| `GET /sync/status` | Consult synchronization status. |

## Partial Failure

A sync batch may partially succeed. The backend should return per-item results.

```json
{
  "processed": 3,
  "created": 2,
  "duplicates": 1,
  "failed": 0,
  "results": []
}
```

## Conflict Strategy

For MVP:

- Duplicate events are treated as already synchronized.
- Invalid references are marked as failed or conflict.
- Observations should not overwrite server records.
- Client must keep failed items available for review.

## Future Evolution

Future versions may introduce background sync workers, exponential backoff, dead-letter queues, and push-based sync status.
