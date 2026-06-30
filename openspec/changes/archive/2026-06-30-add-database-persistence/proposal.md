## Why

The backend currently exposes implemented domain behavior through in-memory/local repositories, which means cattle, users, observations, and activity events do not survive process restarts and cannot be validated against the MariaDB target architecture. Adding database persistence now turns the existing MVP modules into restart-safe services and creates the migration/repository foundation needed for later alerts, dashboard, and offline sync work.

## What Changes

- Add MariaDB-backed persistence infrastructure for the entities already implemented in the backend: users, cattle, activity events, alerts needed by observations, and observations.
- Add versioned SQL migrations, migration execution scripts, and local/test seed support for MVP records.
- Replace or adapt local repositories behind existing use cases with MariaDB repository implementations while preserving current HTTP contracts, authorization behavior, idempotency guarantees, and pagination/filter semantics.
- Add configuration and runtime checks for database connection settings without exposing credentials through public endpoints.
- Add automated verification for migrations, repository behavior, and existing module smoke checks against a prepared MariaDB database.

## Capabilities

### New Capabilities
- `database-persistence`: MariaDB migration, configuration, repository, and seed-data capability shared by implemented backend modules.

### Modified Capabilities
- `backend-runtime`: Backend runtime gains required database configuration and migration/smoke verification behavior.
- `authentication`: User identities used for login are loaded from MariaDB while preserving password secrecy and role rules.
- `cattle-management`: Cattle list, detail, seed data, and cattle event history use persisted MariaDB records.
- `activity-events`: Activity event registration, idempotency, listing, filtering, and cattle history use persisted MariaDB records.
- `observations`: Alert-scoped observation creation, idempotency, timestamp preservation, and consultation use persisted MariaDB records.

## Impact

- Affected backend code: `backend/src/config`, backend module infrastructure folders, repository providers, seed/test support, scripts, and package dependencies/scripts.
- Affected data layer: new MariaDB schema migrations, indexes, foreign keys, idempotency constraints, and seed data for MVP users/cattle/alerts.
- Affected verification: build/test scripts need database-aware checks and documentation for running against local MariaDB.
- No intentional breaking API changes; existing endpoint paths, DTO shapes, role behavior, and standardized errors remain stable.
