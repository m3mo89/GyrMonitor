## Why

The only way to create the first ADMIN account in a fresh environment (e.g. production) is a manual `INSERT` against the `users` table, hand-crafted per environment, because the admin user-management API and UI both require an authenticated ADMIN to already exist. This is error-prone (the password hash must match the app's exact `pbkdf2:sha256:<iterations>:<salt>:<hash>` format, or login silently fails) and was only ever documented as an ad hoc console procedure, never as a maintained, testable script.

## What Changes

- Add a `db:create-admin` backend script that creates a single ADMIN user by reading `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from environment variables, reusing the same validated `CreateUserUseCase`, password hashing, and MariaDB repository already used by the admin user-management API — so the created account is guaranteed to match the format the app expects.
- The script fails clearly (non-zero exit, readable message) on missing env vars, invalid input (short password), or an email that already exists — it does not silently succeed or overwrite an existing user.
- Update `docs/release/deployment-environments.md` and `docs/release/staging-deployment-checklist.md` to reference `npm run db:create-admin --workspace backend` instead of the manual SQL `INSERT` procedure for bootstrapping the first admin in staging/production.

## Capabilities

### Modified Capabilities
- `backend-runtime`: the "Database operational scripts" requirement gains a scenario for discovering the create-admin script alongside migrate/seed/check.
- `user-management`: gains a requirement for command-line admin bootstrap, covering the case where no authenticated ADMIN yet exists to use the API.

## Impact

- **Backend**: new `backend/scripts/create-admin.mjs` (mirrors `scripts/seed-database.mjs`/`scripts/migrate-database.mjs` conventions: `require`s from `dist/`, uses `createConfiguredMariaDbClient()` + try/finally `close()`), new `db:create-admin` script in `backend/package.json`. Reuses `CreateUserUseCase`, `MariaDbUserRepository`, `NodePasswordHasher` from the existing `user-management` and `authentication` modules — no changes to those modules.
- **Docs**: `docs/release/deployment-environments.md` (Production Configuration bullet) and `docs/release/staging-deployment-checklist.md` updated to point at the script instead of a manual `INSERT`.
- **No frontend or API changes.**
