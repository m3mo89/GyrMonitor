## Context

The project now needs a consistent environment model instead of one-off local and staging settings. Development runs the frontend locally and talks to a local backend. Staging runs the frontend at `https://gyr-monitor-staging.vercel.app` and calls `https://gyrmonitor-staging.up.railway.app/api/v1`. Production runs the frontend at `https://gyr-monitor.vercel.app` and calls `https://gyrmonitor-production.up.railway.app/api/v1`.

The frontend reads `import.meta.env.VITE_API_BASE_URL` at build time and otherwise falls back to localhost. The backend must therefore expose a matching CORS allowlist per environment. Authentication is a bearer-token flow, not a cookie flow. That reduces cross-site cookie complexity, but browser login still requires CORS preflight success for `POST /auth/login`.

Login also depends on a prepared MariaDB database because persisted users are loaded from the database and the seed credentials are inserted by the seed script, not by the login endpoint. Development and staging can use deterministic non-production seed data; production must use explicitly provisioned users and production secrets.

## Goals / Non-Goals

**Goals:**
- Configure development, staging, and production without source edits per deploy target.
- Allow each environment's frontend origin to call only the matching backend API.
- Make required Vercel and Railway environment variables and build commands explicit and documented.
- Provide a repeatable way to verify environment prerequisites: API URL, CORS, migrations/users, and login.
- Improve diagnostics enough to distinguish invalid credentials from unreachable/misconfigured API calls.

**Non-Goals:**
- Replace JWT bearer authentication with cookies or refresh tokens.
- Create production user-management flows.
- Commit real staging or production secrets.
- Make development seed data run automatically in production without an explicit operator choice.

## Decisions

1. **Use an environment-driven backend CORS allowlist.**

   Add configuration such as `CORS_ALLOWED_ORIGINS` or `FRONTEND_ORIGINS` parsed as a comma-separated list. Defaults should preserve the current local origins. Railway staging can set `https://gyr-monitor-staging.vercel.app`; production must set `https://gyr-monitor.vercel.app`.

   Alternative considered: hard-code the staging URL in `main.ts`. That would fix one deploy but make future preview/staging/prod URLs require code edits and redeploys.

2. **Keep the frontend API base URL as a Vite build-time variable and define mode/build-command conventions.**

   Local development can keep the local fallback. Vercel staging can use a branch-specific build command or environment variable that sets `VITE_API_BASE_URL=https://gyrmonitor-staging.up.railway.app/api/v1`. Production uses a branch-specific build command that sets `VITE_API_BASE_URL=https://gyrmonitor-production.up.railway.app/api/v1`.

   Alternative considered: infer the backend URL from `window.location`. The frontend and backend are deployed on different providers/domains, so inference would be brittle.

3. **Verify authentication with explicit database preparation per environment.**

   Local and staging should run migrations and either run the non-production seed script or have equivalent test/staging users provisioned. Production must run migrations and provision real users through an operational process, not deterministic seed credentials. Verification should use the same public login endpoint and assert the standard login envelope.

   Alternative considered: add a separate fake login path for staging. That would weaken parity with the real runtime and hide database/auth problems.

4. **Expose clearer frontend failure categories without leaking sensitive details.**

   Login UI can continue showing a friendly message, while code/tests distinguish network/CORS/API-base-url failures from `UNAUTHORIZED`. This helps operators debug staging without exposing secrets to users.

   Alternative considered: surface raw backend/network errors in the UI. That is useful during debugging but too noisy and potentially revealing for deployed users.

## Risks / Trade-offs

- [Risk] Overly broad CORS configuration could allow unwanted browser origins. -> Mitigation: require exact HTTPS origins in staging/prod and keep wildcard out of documented deployment values.
- [Risk] Staging seed users use known non-production credentials. -> Mitigation: document them as staging-only/demo data and require real secret/user provisioning for production.
- [Risk] Vite variables are baked at build time, so changing Vercel env vars without redeploying will not update the app. -> Mitigation: document redeploy requirement and add environment notes near frontend setup.
- [Risk] Railway may set `PORT` and bind expectations differently from local development. -> Mitigation: preserve current `PORT` handling and document `BACKEND_HOST=0.0.0.0` when the platform requires external binding.
- [Risk] Production deploys accidentally reuse staging URLs or seed credentials. -> Mitigation: document production as requiring explicit frontend/backend URL values, exact CORS origin, real secrets, and provisioned users.

## Migration Plan

1. Add CORS origin configuration to backend config and bootstrap.
2. Update backend `.env.example` and docs with development defaults plus staging and production expectations.
3. Update frontend `.env.example`/docs with local defaults, staging build command/URL, and production placeholder requirements.
4. Add tests or smoke checks for configured CORS origins and login with persisted users.
5. Deploy staging backend with `CORS_ALLOWED_ORIGINS=https://gyr-monitor-staging.vercel.app`, `API_PREFIX=/api/v1`, database variables, `JWT_SECRET`, and appropriate host/port settings.
6. Run migrations and staging seed/provisioning on Railway.
7. Redeploy staging frontend through branch-specific build command or `VITE_API_BASE_URL=https://gyrmonitor-staging.up.railway.app/api/v1`.
8. Before production deployment, configure `CORS_ALLOWED_ORIGINS=https://gyr-monitor.vercel.app`, run migrations, and provision production users/secrets.

Rollback: restore the previous backend deployment and frontend build. Since this change only affects runtime config, docs, and verification behavior, no data migration rollback is expected.

## Open Questions

- Should staging use the existing deterministic seed credentials, or should a separate staging admin be provisioned outside the seed script?
- Should Vercel preview deployments be allowed by a broader preview-origin pattern later, or should each preview URL be explicitly added?
