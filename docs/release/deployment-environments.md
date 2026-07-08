# Deployment Environments

This matrix keeps the frontend build, backend runtime, CORS policy, database state, and login verification aligned per environment.

| Environment | Frontend URL | Backend API URL | Frontend build/config | Backend CORS origin | Users and seed policy |
| --- | --- | --- | --- | --- | --- |
| Development | `http://localhost:5173` or `http://127.0.0.1:5173` | `http://localhost:3000/api/v1` or `http://127.0.0.1:3000/api/v1` | `npm run dev --workspace frontend`, `npm run build:local --workspace frontend`, or local `VITE_API_BASE_URL` | default local origins | Run migrations and optional non-production seed data |
| Staging | `https://gyr-monitor-staging.vercel.app` | `https://gyrmonitor-staging.up.railway.app/api/v1` | `npm run build:staging --workspace frontend`; generic build infers staging from `VERCEL_GIT_COMMIT_REF=staging` | `https://gyr-monitor-staging.vercel.app` | Run migrations, then seed deterministic non-production users or provision staging users via the `/users` admin page |
| Production | `https://gyr-monitor.vercel.app` | `https://gyrmonitor-production.up.railway.app/api/v1` | `npm run build:production --workspace frontend`; generic build infers production from `VERCEL_ENV=production` | `https://gyr-monitor.vercel.app` | Run migrations, then bootstrap the first ADMIN with `npm run db:create-admin`; provision every other user via the ADMIN-only `/users` page or `POST /api/v1/users`; never run `db:seed` in production |

## Production Configuration

Configure production with these values:

- Production frontend URL: `https://gyr-monitor.vercel.app`
- Production backend API URL: `https://gyrmonitor-production.up.railway.app/api/v1`
- Railway production `CORS_ALLOWED_ORIGINS=https://gyr-monitor.vercel.app`
- Vercel production `VITE_API_BASE_URL=https://gyrmonitor-production.up.railway.app/api/v1`
- Production `JWT_SECRET` using a real secret value
- Production MariaDB configuration through `DATABASE_URL` or explicit `DB_*` variables
- Provisioned production user accounts: bootstrap the very first ADMIN with `ADMIN_EMAIL=<email> ADMIN_PASSWORD=<password> npm run db:create-admin --workspace backend` (run once, against the migrated production database) — do not run `db:seed` against production. Once that first ADMIN exists, provision every additional user (any role, including more admins) through the ADMIN-only `/users` page or `POST /api/v1/users`.

The production frontend build command injects the production API URL and refuses local, staging, or unexpected API URLs:

```sh
npm run build:production --workspace frontend
```

## Production Verification

After production deploy:

```sh
curl -i https://gyrmonitor-production.up.railway.app/api/v1
curl -i -X OPTIONS https://gyrmonitor-production.up.railway.app/api/v1/auth/login \
  -H 'Origin: https://gyr-monitor.vercel.app' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
curl -i -X POST https://gyrmonitor-production.up.railway.app/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"<provisioned-user-email>","password":"<provisioned-user-password>"}'
```

Expected checks:

1. API availability returns the public health envelope.
2. CORS preflight returns `access-control-allow-origin` with the exact production frontend origin.
3. The database schema has all migrations applied.
4. Login succeeds for a provisioned production user.
5. Invalid credentials return the standardized `UNAUTHORIZED` envelope.

If login fails, isolate the cause in this order: API reachability, CORS, database migrations, user provisioning, credentials.
