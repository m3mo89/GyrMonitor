# MariaDB

MariaDB is the central persistence engine for the MVP.

## Core Tables

```text
users
cattle
activity_events
alerts
observations
sync_logs
idempotency_keys
```

## Recommended Conventions

- Use UUIDs for public identifiers.
- Store timestamps in UTC.
- Use `created_at` and `updated_at` where applicable.
- Avoid hard deletes for operational records when traceability matters.
- Add indexes for common filters: `cattle_id`, `captured_at`, `status`, `severity`.

## Important Constraints

- `activity_events.event_id` should be unique.
- idempotency keys should be unique per client/request scope.
- alerts should reference originating event when generated from inactivity.
