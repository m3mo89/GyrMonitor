## Why

GyrMonitor needs one explicit environment model for local development, staging, and production so each frontend build points at the correct backend and each backend only accepts the intended browser origins. The immediate login failure in staging exposed the gap: runtime behavior depended on local defaults and ad hoc deploy settings instead of a documented environment matrix.

## What Changes

- Add explicit deployment configuration guidance for development, staging, and production, including frontend API base URLs and backend allowed web origins.
- Make backend CORS origins environment-driven so staging and production can each allow only their intended frontend origins without code changes per environment.
- Keep `POST /api/v1/auth/login` public while ensuring browser preflight requests from allowed frontend origins succeed.
- Document database preparation expectations per environment: local/staging can use deterministic non-production seed data, while production must use provisioned real users and secrets.
- Add smoke/debug coverage that can verify environment login prerequisites: API availability, CORS allowance, database-backed user availability, and login response shape.
- Improve frontend environment notes so deployed builds fail less silently when `VITE_API_BASE_URL` is missing or points at the wrong backend.

## Capabilities

### New Capabilities

- `deployment-environments`: Environment contract for development, staging, and production frontend/backend URLs, browser access rules, database preparation, and deployment verification.

### Modified Capabilities

- `backend-runtime`: Backend runtime must support environment-configured CORS origins for local and deployed frontend clients.
- `web-frontend-architecture`: Web frontend runtime configuration must document and validate the API base URL used by local, staging, and production builds.
- `authentication`: Login must be verifiable in each environment with allowed browser origins and prepared persisted users.

## Impact

- Affects `backend/src/config/app.config.ts`, `backend/src/main.ts`, backend env examples/docs, and likely backend runtime/smoke tests.
- Affects `frontend/.env.example`, frontend README/setup notes, and possibly API client configuration diagnostics.
- Affects deployment configuration in Vercel and Railway through required environment variables and branch/environment-specific build commands.
- Does not change the login API contract or introduce cookies/session refresh; the existing bearer-token login flow remains in place.
