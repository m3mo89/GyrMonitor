# Database Migrations

Migrations must be versioned and reviewed like application code.

## Rules

- Every schema change must have a migration.
- Migrations should be deterministic.
- Destructive migrations require explicit review.
- Seed data must not be mixed with schema changes unless required.
- Migration names should describe intent.

## Suggested Naming

```text
20260620_create_cattle_table
20260620_create_activity_events_table
20260620_create_alerts_table
20260620_add_idempotency_keys
```
