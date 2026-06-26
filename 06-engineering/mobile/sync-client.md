# Mobile Sync Client

The sync client processes pending local operations and sends them to the backend using sync endpoints.

## Flow

```mermaid
sequenceDiagram
  participant App as Mobile App
  participant DB as SQLite
  participant Sync as Sync Client
  participant API as Backend API

  App->>DB: Save observation locally
  App->>DB: Add SyncQueue item
  Sync->>DB: Read pending items
  Sync->>API: POST /sync/observations
  API-->>Sync: Sync result
  Sync->>DB: Mark item as synced or failed
```

## Idempotency

Every sync request must include a stable `Idempotency-Key` so retries do not create duplicate server records.
