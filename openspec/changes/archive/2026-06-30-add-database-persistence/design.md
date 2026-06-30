## Context

The backend is a NestJS application with clean application/domain boundaries and local repository implementations for authentication, cattle, activity events, alerts, and observations. The knowledge base names MariaDB as the MVP persistence engine and defines repository interfaces as the boundary that protects use cases from SQL or ORM details. Current local repositories are useful for feature scaffolding, but they lose data on restart and cannot enforce relational constraints, idempotency, indexes, or migration discipline.

This change introduces a shared database-persistence capability and switches implemented modules to MariaDB-backed repositories without changing the public HTTP contracts already covered by authentication, cattle management, activity events, and observations.

## Goals / Non-Goals

**Goals:**
- Add versioned MariaDB schema migrations for implemented entities and supporting lookup tables.
- Add database configuration, connection lifecycle, and scripts for migration, seed, and repository verification.
- Implement MariaDB repositories behind existing use-case ports for users, cattle, activity events, alerts, and observations.
- Preserve idempotency through database uniqueness constraints for `activity_events.event_id` and `observations.observation_id`.
- Preserve UTC timestamps, stable UUID public identifiers, pagination, filtering, role behavior, and standardized error behavior.
- Seed development/test data for MVP users, cattle, alerts, sample events, and sample observations without mixing seeds into schema migrations.

**Non-Goals:**
- Build the complete alert generation lifecycle, dashboard aggregation layer, offline sync tables, or sync log behavior.
- Change endpoint URLs, DTO shapes, authentication strategy, or frontend workflows.
- Add destructive data migrations or production deployment automation beyond local/test scripts and documented rollback.
- Introduce real farm, user, or animal health data.

## Decisions

1. Use explicit SQL migrations and a thin MariaDB data access layer.

   Migrations will live under backend-owned database infrastructure, be ordered by timestamped filenames, and run through a script exposed by `backend/package.json`. This matches the knowledge-base migration rules and keeps schema evolution reviewable. A full ORM was considered, but the current codebase has simple repository contracts and no ORM dependency; explicit SQL keeps this change smaller and makes constraints/indexes obvious.

2. Keep repository interfaces in the application layer and put MariaDB implementations in infrastructure.

   Use cases will continue to depend on ports such as `UserRepository`, `CattleRepository`, `ActivityEventRepository`, `AlertLookup`, and `ObservationRepository`. MariaDB repositories will map rows to domain/application models and will not expose SQL rows or driver entities to use cases. Rewriting use cases around a database client was considered, but it would leak persistence concerns into business behavior.

3. Model public ids as UUID strings and database timestamps as UTC.

   Tables will store the stable ids already used by API contracts. `created_at`, `updated_at`, `captured_at`, and client-provided observation timestamps will be treated as UTC. This avoids a public-id migration and preserves existing DTO behavior.

4. Enforce idempotency and uniqueness in the database.

   `users.email`, `cattle.tag_number`, `activity_events.event_id`, and `observations.observation_id` will be unique. Repositories will use transactions or duplicate-key handling to return the existing record for accepted duplicate event/observation ids. Application-level map checks alone were considered insufficient because they do not protect concurrent requests.

5. Seed data is separate from schema migrations.

   A seed script will insert deterministic development/test data after migrations have run. Seeds will include the currently expected local users and enough cattle/alert/event/observation data to exercise implemented workflows. Keeping seeds separate avoids accidental production data mutation when schema migrations are applied.

## Risks / Trade-offs

- MariaDB availability becomes required for full backend smoke verification -> Provide clear `.env.example` settings, migration scripts, and a database-aware smoke/check command that fails with actionable errors.
- Replacing local repositories can break existing feature checks -> Keep repository ports stable and add repository-level tests before switching providers.
- Duplicate-key handling can accidentally hide payload conflicts -> On duplicate `eventId` or `observationId`, return the existing record only when lookup confirms the stored record; do not create a second row.
- SQL date/time handling can drift by local timezone -> Normalize inputs/outputs as UTC ISO strings and verify timestamp preservation in tests.
- Migration rollback is limited for initial schema creation -> Use forward-only create-table migrations for MVP and document rollback as dropping newly-created tables only in non-production local/test databases.

## Migration Plan

1. Add database configuration variables to `.env.example` and configuration loading.
2. Add MariaDB driver dependency, connection factory, migration runner, and package scripts.
3. Create schema migrations for users, cattle, alerts, activity events, and observations with constraints and indexes.
4. Add seed script separate from migrations.
5. Implement MariaDB repositories and repository tests against a prepared MariaDB database.
6. Switch module providers from local repositories to MariaDB repositories while retaining local data only as seed fixtures.
7. Run migration, seed, build, repository checks, and existing module smoke checks.

Rollback for local/test environments is to stop the backend, restore repository providers if needed, and drop the newly-created schema or tables. Production rollback is out of scope until deployment automation exists.

## Open Questions

- Should the implementation use a lightweight query builder or the raw MariaDB driver if repository SQL grows beyond the current MVP queries?
- What exact database name and credentials should be used by the default local docker/developer environment if one is later added?
