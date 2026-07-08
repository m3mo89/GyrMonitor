# Backend Foundation

This folder contains the NestJS-oriented backend foundation for GyrMonitor.

Source guidance:

- `knowledge-base/06-engineering/backend/overview.md`
- `knowledge-base/07-reference/directory-map.md`
- `knowledge-base/05-api/authentication.md`
- `knowledge-base/04-architecture/security-architecture.md`
- `knowledge-base/07-reference/roles-and-permissions.md`

The backend implements the full MVP domain set on top of the authentication foundation (local/test users, password hashing, JWT login, reusable authentication guard, reusable role guard):

- `authentication` — login, JWT issuance, guards, roles
- `user-management` — ADMIN-only user create/list/disable/reactivate/reset-password (`/users`)
- `cattle-monitoring` — cattle registration and activity events
- `inspections` — observations linked to alerts (`alerts/:alertId/observations`)
- `inactivity-analysis` / `activity-events` — risk scoring inputs from activity/inactivity data
- `alerts` — alert generation, listing, detail lookup, status lifecycle
- `dashboard` — aggregated metrics (`GET /dashboard`)
- `offline-sync` — batched, idempotent sync endpoints for mobile/desktop clients

## Local Database

The implemented backend modules use MariaDB-backed repositories. Configure a local database with the `.env.example` keys:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_CONNECTION_LIMIT`

`DATABASE_URL` remains available as a compact default, while the explicit `DB_*` keys take precedence.

Run database commands from the workspace root:

```sh
npm run db:migrate --workspace backend
npm run db:seed --workspace backend
npm run db:check --workspace backend
```

`db:migrate` applies versioned SQL migrations and records applied versions in `schema_migrations`. `db:seed` loads repeatable non-production MVP records. `db:check` builds the backend, applies migrations twice to verify idempotency, seeds data, and exercises the MariaDB repositories for authentication, cattle/event persistence, alert generation/filtering, observation idempotency, and UTC timestamp preservation.

## Staging on Railway

Railway staging should run the compiled backend with these environment values:

- `API_PREFIX=/api/v1`
- `BACKEND_HOST=0.0.0.0` when Railway requires binding outside localhost
- `CORS_ALLOWED_ORIGINS=https://gyr-monitor-staging.vercel.app`
- MariaDB configuration through `DATABASE_URL` or the explicit `DB_*` variables
- `JWT_SECRET` set to a staging secret, not the example value
- `SWAGGER_ENABLED=false` unless staging API docs are intentionally exposed

Prepare the staging database before validating login:

```sh
npm run db:migrate --workspace backend
npm run db:seed --workspace backend
```

The seed command creates deterministic non-production users such as `admin@gyrmonitor.local` / `local-admin-password`. For a stricter staging environment, provision an equivalent staging admin user instead of using seed credentials.

## Production on Railway

Railway production should run with these environment values:

- `API_PREFIX=/api/v1`
- `BACKEND_HOST=0.0.0.0` when Railway requires non-local binding
- `CORS_ALLOWED_ORIGINS=https://gyr-monitor.vercel.app`
- MariaDB configuration through `DATABASE_URL` or the explicit `DB_*` variables
- `JWT_SECRET` set to a production secret, not the example value
- `SWAGGER_ENABLED=false` unless production API docs are intentionally exposed

Run migrations before validating production login. Production users must be provisioned explicitly; do not rely on deterministic seed credentials for production. Bootstrap the first ADMIN user with:

```sh
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=<strong-password> npm run db:create-admin --workspace backend
```

This runs `scripts/create-admin.mjs`, which creates a single ADMIN user using the same validation, role assignment, and password hashing as the `/users` create-user endpoint, and exits non-zero without writing anything if the credentials are missing, the email already exists, or the password is too weak. Once at least one ADMIN exists, use the `/users` endpoints (or the frontend user-management page) to provision additional users.

## API Documentation

The backend serves interactive OpenAPI (Swagger) documentation at `/api/docs`, and the raw OpenAPI document at `/api/docs-json`, generated from the live controllers. These paths are independent of `API_PREFIX`, so they stay stable if the API version prefix changes.

Docs are enabled by default outside production. Control this with `SWAGGER_ENABLED` (`true`/`false`) in `.env`; when disabled, `/api/docs` returns 404 while the rest of the API is unaffected.

## Local Authentication

Use local-only credentials for development and tests. They are intentionally documented as non-production examples:

- `admin@gyrmonitor.local` / `local-admin-password`
- `researcher@gyrmonitor.local` / `local-researcher-password`
- `field@gyrmonitor.local` / `local-field-password`
- `system@gyrmonitor.local` / `local-system-password`

Configure JWT and hashing with `.env.example` keys. Do not commit production secrets or real user credentials.

## Commands

```sh
npm run dev --workspace backend
npm run start --workspace backend
npm run db:migrate --workspace backend
npm run db:seed --workspace backend
npm run db:check --workspace backend
npm run smoke:http --workspace backend
npm run build --workspace backend
npm run lint --workspace backend
npm run format:check --workspace backend
npm run test --workspace backend
```

The development command starts the Nest runtime locally. The smoke command builds the backend, starts the compiled HTTP server on a test port, and verifies the public availability endpoint plus protected alert-route authentication at `/api/v1`. Set `SMOKE_WITH_DATABASE=true` to also run migrations/seeds and verify login, invalid-login `UNAUTHORIZED` behavior, inactivity alert generation, alert listing, and alert detail traceability through HTTP.

To verify CORS for a deployed frontend origin during smoke checks, set `SMOKE_CORS_ORIGIN`, for example:

```sh
SMOKE_CORS_ORIGIN=https://gyr-monitor-staging.vercel.app npm run smoke:http --workspace backend
```
