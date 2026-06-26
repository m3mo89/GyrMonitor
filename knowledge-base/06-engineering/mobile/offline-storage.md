# Mobile Offline Storage

Mobile offline storage uses SQLite.

## Stored Data

- Cached alerts.
- Pending observations.
- Sync queue entries.
- Minimal cattle metadata required to understand alerts.

## Rules

- Offline operations must be written locally before being queued.
- Each queued operation must have a stable local ID.
- Failed sync attempts should increment retry count.
- Users must be able to see whether data is pending synchronization.
