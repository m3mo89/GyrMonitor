## 1. Backend Runtime Configuration

- [x] 1.1 Add a backend config field for comma-separated allowed CORS origins, preserving local development defaults.
- [x] 1.2 Update Nest bootstrap CORS setup to use the configured origin allowlist.
- [x] 1.3 Add tests or verification coverage for default local origins, staging origin, multiple configured origins, and unconfigured origin behavior.
- [x] 1.4 Update `backend/.env.example` with the staging CORS allowlist variable and Railway host/port notes.

## 2. Frontend Environment Configuration

- [x] 2.1 Update frontend environment documentation to state that Vercel staging must set `VITE_API_BASE_URL=https://gyrmonitor-staging.up.railway.app/api/v1`.
- [x] 2.2 Document that Vite env vars are build-time values and require a Vercel redeploy after changes.
- [x] 2.3 Add a lightweight frontend config diagnostic or test that prevents the localhost API fallback from being mistaken for a staging build.
- [x] 2.4 Keep local developer defaults working for `http://127.0.0.1:3000/api/v1` or `http://localhost:3000/api/v1`.
- [x] 2.5 Add production frontend build guidance that requires an explicit production API base URL once the production backend URL is selected.
- [x] 2.6 Add a frontend configuration check that treats deployed production builds using local or staging API URLs as misconfigured.

## 3. Staging Database and Authentication Verification

- [x] 3.1 Document the Railway staging database preparation sequence: run migrations, then seed deterministic non-production users or provision an equivalent staging user.
- [x] 3.2 Add or extend a smoke verification path that checks API availability under `/api/v1`.
- [x] 3.3 Add or extend a smoke verification path that checks login with a prepared staging user and validates the standard success envelope.
- [x] 3.4 Ensure invalid credentials in staging still return the documented `UNAUTHORIZED` envelope.
- [x] 3.5 Add troubleshooting notes that separate API reachability, CORS rejection, missing seed/provisioning, and invalid credentials.

## 4. Deployment Notes

- [x] 4.1 Document Railway staging variables: `API_PREFIX=/api/v1`, exact frontend CORS origin, database variables, `JWT_SECRET`, and platform host/port settings.
- [x] 4.2 Document Vercel staging variables: `VITE_API_BASE_URL` and any existing app metadata variables.
- [x] 4.3 Add a short staging checklist to the README or deployment docs with the expected frontend/backend URLs.
- [x] 4.4 Include rollback guidance for reverting config-only deployment changes.
- [x] 4.5 Add an environment matrix covering development, staging, and production frontend URL, backend URL, CORS origin, user provisioning, and seed policy.
- [x] 4.6 Document production deployment placeholders without inventing final production URLs, including exact CORS origin, production `VITE_API_BASE_URL`, real `JWT_SECRET`, and provisioned users.

## 5. Verification

- [x] 5.1 Run targeted backend tests for runtime config and authentication.
- [x] 5.2 Run targeted frontend tests or build checks for API base URL configuration.
- [x] 5.3 Run OpenSpec validation/status for `configure-staging-environment`.
- [x] 5.4 Record the manual staging commands or platform checks used to confirm the deployed login path.
- [x] 5.5 Add or document production verification steps that confirm API availability, exact production CORS allowance, migrated database schema, provisioned production users, and login response shape.
- [x] 5.6 Re-run OpenSpec validation/status after the production-readiness artifact updates.
