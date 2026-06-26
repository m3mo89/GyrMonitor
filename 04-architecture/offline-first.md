---
title: Offline First Architecture
area: architecture
version: 0.1
status: approved
owner: architecture
source_documents:
  - DOC-01_GyrMonitor_V2_Academico
  - DOC-03_GyrMonitor_Contratos_Backend_V2_Academico
---

# Offline First Architecture

## Purpose

This document describes how mobile and desktop clients continue operating when internet connectivity is unavailable or unstable.

## Offline Scope

Offline First applies primarily to:

- Mobile field workflows.
- Desktop simulation workflows.
- Observation capture.
- Pending event capture.
- Synchronization after connectivity returns.

The web dashboard may use resilient read cache, but it is not the main offline client in the MVP.

## Local Persistence

Mobile and desktop clients use SQLite to persist:

- Local alerts.
- Pending activity events.
- Pending observations.
- Sync Queue items.
- Retry metadata.

## Offline Flow

```mermaid
sequenceDiagram
    participant Client as Mobile/Desktop
    participant SQLite
    participant Queue as SyncQueue
    participant API as Backend API
    participant DB as MariaDB

    Client->>SQLite: Save event or observation locally
    SQLite->>Queue: Register pending operation
    Note over Client,Queue: No connectivity
    Client->>API: POST /sync/* with Idempotency-Key
    API->>DB: Persist if not duplicate
    API-->>Client: Sync result
    Client->>Queue: Mark item as synced
```

## Offline Data States

| State | Meaning |
|---|---|
| PENDING | Stored locally and waiting for sync. |
| SYNCING | Currently being sent to backend. |
| SYNCED | Accepted by backend. |
| FAILED | Sync failed and may be retried. |
| CONFLICT | Server rejected operation due to conflict. |

## User Experience Requirements

The client must clearly indicate when:

- The user is offline.
- Data was saved locally.
- Synchronization is pending.
- Synchronization failed.
- Data may be stale.

## Business Rule

Offline availability must not create duplicate server records. Every retryable operation must be idempotent or uniquely identifiable.

## MVP Constraints

The MVP does not require full offline editing of every entity. Offline behavior is focused on field-critical operations.
