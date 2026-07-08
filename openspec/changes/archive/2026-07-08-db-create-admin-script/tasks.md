## 1. Script implementation

- [x] 1.1 Create `backend/scripts/create-admin.mjs` following the `require`-from-`dist/` pattern used by `scripts/seed-database.mjs` and `scripts/migrate-database.mjs`
- [x] 1.2 Read `ADMIN_NAME` (default `'Administrador'`), `ADMIN_EMAIL` (required), `ADMIN_PASSWORD` (required) from `process.env`; exit 1 with a clear message before any DB call if a required var is missing
- [x] 1.3 Construct `CreateUserUseCase` from `MariaDbUserRepository` and `NodePasswordHasher(appConfig.passwordHashIterations)` and call `execute({ name, email, role: Roles.ADMIN, password })`
- [x] 1.4 On success, print the created user's id/email/role (never the password or hash) and exit 0
- [x] 1.5 On `EmailAlreadyExistsError` or `InvalidUserInputError`, print a one-line message from the error and exit 1 (no stack trace)
- [x] 1.6 On any other error (e.g. DB unreachable), print the error and exit 1
- [x] 1.7 Ensure the database client is closed in a `finally` block regardless of outcome

## 2. Wiring

- [x] 2.1 Add `"db:create-admin": "npm run build && node scripts/create-admin.mjs"` to `backend/package.json` scripts

## 3. Verification

- [x] 3.1 Run `npm run db:create-admin` locally against the dev database with `ADMIN_EMAIL`/`ADMIN_PASSWORD` set and confirm the created user can log in via `POST /api/v1/auth/login`
- [x] 3.2 Re-run with the same `ADMIN_EMAIL` and confirm it exits non-zero with an "already exists" message and does not modify the existing user
- [x] 3.3 Run without `ADMIN_EMAIL`/`ADMIN_PASSWORD` set and confirm it exits non-zero with a clear missing-variable message before touching the database
- [x] 3.4 Run with an `ADMIN_PASSWORD` shorter than the minimum length and confirm it exits non-zero with the length requirement in the message

## 4. Docs

- [x] 4.1 Update `docs/release/deployment-environments.md` (Production Configuration bullet) to reference `npm run db:create-admin --workspace backend` instead of a manual `INSERT` for the first admin
- [x] 4.2 Checked `docs/release/staging-deployment-checklist.md` — it never referenced manual admin bootstrap (staging already uses `db:seed`), so no change needed
