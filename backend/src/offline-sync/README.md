# Offline Sync

Store-and-forward synchronization for mobile and desktop clients, per `knowledge-base/05-api/offline-sync.md` and `knowledge-base/04-architecture/sync-architecture.md`.

## Endpoints

- `POST /api/v1/sync/events` — synchronize pending activity/inactivity events (delegates to `activity-events`).
- `POST /api/v1/sync/observations` — synchronize pending observations (delegates to `inspections`).
- `GET /api/v1/sync/status` — recent synchronization attempts for a client.

## Idempotency

Every sync request requires an `Idempotency-Key` header. Outcomes are recorded in the `sync_log` table:

- Same key + same payload → the previously recorded result is returned without reprocessing.
- Same key + different payload → `IDEMPOTENCY_CONFLICT` (409).

## Duplicate detection

Within a batch, each item is checked against the existing `activity-events`/`observations` records by client-provided id before delegating to their creation use cases, so retried items are reported as `DUPLICATE` instead of being recreated.
