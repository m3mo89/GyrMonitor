# SQLite

SQLite enables mobile and desktop clients to keep working during connectivity loss.

## Local Tables

```text
local_alerts
pending_events
pending_observations
sync_queue
```

## Responsibilities

- Store pending field observations.
- Store generated or captured events when offline.
- Preserve local operation order through `sync_queue`.
- Track retry count and sync status.

## Sync Status Values

```text
PENDING
SYNCING
SYNCED
FAILED
CONFLICT
```

## Rule

Local data must keep enough metadata to safely synchronize later, including local ID, server ID when known, operation type, timestamps and retry count.
