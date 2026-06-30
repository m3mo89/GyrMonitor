## 1. Database Foundation

- [x] 1.1 Add MariaDB driver dependency and database-related package scripts to `backend/package.json`
- [x] 1.2 Extend backend configuration and `.env.example` with required MariaDB host, port, database, user, password, and connection settings
- [x] 1.3 Implement a shared MariaDB connection factory with clear configuration and connectivity errors
- [x] 1.4 Add a versioned migration runner that records applied migration versions and skips already-applied migrations
- [x] 1.5 Add a database-aware verification script that fails clearly when MariaDB is unreachable or misconfigured

## 2. Schema Migrations and Seeds

- [x] 2.1 Create initial schema migration for `users` with unique normalized email and approved role storage
- [x] 2.2 Create initial schema migration for `cattle` with UUID ids, unique tag numbers, status, sex, timestamps, and cattle list/detail fields
- [x] 2.3 Create initial schema migration for `activity_events` with cattle foreign key, unique `event_id`, `captured_at`, `created_at`, and query indexes
- [x] 2.4 Create initial schema migration for `alerts` sufficient for persisted observation alert lookup and future source-event traceability
- [x] 2.5 Create initial schema migration for `observations` with alert foreign key, unique `observation_id`, user id, client id, comment, and timestamp fields
- [x] 2.6 Add deterministic development/test seed script for MVP users, cattle, alerts, sample activity events, and sample observations
- [x] 2.7 Make seed inserts repeatable without duplicate records or real farm/user/animal-health data

## 3. Repository Implementations

- [x] 3.1 Implement MariaDB user repository behind the existing authentication repository port
- [x] 3.2 Implement MariaDB cattle repository behind the existing cattle repository port
- [x] 3.3 Implement MariaDB activity-event repository with idempotent duplicate `eventId` handling, listing, filtering, and cattle-history support
- [x] 3.4 Implement MariaDB alert lookup repository for observation validation
- [x] 3.5 Implement MariaDB observation repository with idempotent duplicate `observationId` handling and alert-scoped listing
- [x] 3.6 Keep SQL row mapping inside infrastructure and return domain/application models to use cases

## 4. Module Integration

- [x] 4.1 Switch authentication providers from local user repository to MariaDB user repository
- [x] 4.2 Switch cattle-monitoring providers from local cattle repository to MariaDB cattle repository
- [x] 4.3 Switch activity-events providers from local activity-event repository to MariaDB activity-event repository
- [x] 4.4 Switch inspections providers from local alert/observation repositories to MariaDB repositories
- [x] 4.5 Retain local fixture data only as seed inputs or test fixtures, not as runtime fallback for database-backed workflows

## 5. Verification

- [x] 5.1 Add repository checks covering login, cattle list/detail/existence, event create/list/idempotency, and observation create/list/idempotency against MariaDB
- [x] 5.2 Verify UTC timestamp preservation for activity event `capturedAt` and observation `createdAt`
- [x] 5.3 Verify migration idempotency by running migrations twice against the same prepared database
- [x] 5.4 Verify duplicate unique identifiers fail or return existing records according to the relevant repository contract
- [x] 5.5 Run backend build and existing module smoke/check scripts after provider integration
- [x] 5.6 Document local migration, seed, and database verification commands in backend documentation
