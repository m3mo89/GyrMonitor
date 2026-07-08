# Staging Deployment Checklist

For the full development, staging, and production matrix, see `docs/release/deployment-environments.md`.

Use this checklist for the staging pair:

- Frontend: `https://gyr-monitor-staging.vercel.app`
- Backend API: `https://gyrmonitor-staging.up.railway.app/api/v1`

## Railway Backend

Set these variables before deploying:

- `API_PREFIX=/api/v1`
- `BACKEND_HOST=0.0.0.0` when Railway requires non-local binding
- `CORS_ALLOWED_ORIGINS=https://gyr-monitor-staging.vercel.app`
- `DATABASE_URL` or the explicit `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` with a staging secret value
- `SWAGGER_ENABLED=false` unless staging docs are intentionally exposed

Prepare database state:

```sh
npm run db:migrate --workspace backend
npm run db:seed --workspace backend
```

The deterministic staging/demo login after seeding is:

```text
admin@gyrmonitor.local / local-admin-password
```

## Vercel Frontend

For the staging branch, configure this build command:

```sh
npm run build:staging --workspace frontend
```

That command sets `VITE_API_BASE_URL` for staging during the build. If the generic build command is used instead, set these variables before deploying:

The generic `npm run build --workspace frontend` also infers staging when Vercel exposes `VERCEL_GIT_COMMIT_REF=staging`.

- `VITE_API_BASE_URL=https://gyrmonitor-staging.up.railway.app/api/v1`
- `VITE_APP_NAME=GyrMonitor`
- `VITE_ENABLE_MOCKS=false`
- `VITE_AUTH_SESSION_STORAGE=localStorage`

Redeploy after changing `VITE_*` variables because Vite embeds them at build time.

## Verification

Local equivalent smoke for CORS and API availability:

```sh
SMOKE_CORS_ORIGIN=https://gyr-monitor-staging.vercel.app npm run smoke:http --workspace backend
```

Database-backed local equivalent smoke:

```sh
SMOKE_WITH_DATABASE=true SMOKE_CORS_ORIGIN=https://gyr-monitor-staging.vercel.app npm run smoke:http --workspace backend
```

Deployed API checks:

```sh
curl -i https://gyrmonitor-staging.up.railway.app/api/v1
curl -i -X OPTIONS https://gyrmonitor-staging.up.railway.app/api/v1/auth/login \
  -H 'Origin: https://gyr-monitor-staging.vercel.app' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
curl -i -X POST https://gyrmonitor-staging.up.railway.app/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@gyrmonitor.local","password":"local-admin-password"}'
```

If login fails, isolate in this order:

1. API reachability: `/api/v1` should return the availability envelope.
2. CORS: preflight should include `access-control-allow-origin: https://gyr-monitor-staging.vercel.app`.
3. Database: migrations and seed/provisioning must have run in the Railway database.
4. Credentials: invalid credentials should return the standardized `UNAUTHORIZED` envelope.

## Rollback

Restore the previous Railway and Vercel environment values, then redeploy the affected service. No database rollback is expected for config-only changes.
