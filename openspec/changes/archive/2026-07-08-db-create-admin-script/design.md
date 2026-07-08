## Context

Every other database-provisioning operation in the backend is a maintained script (`db:migrate`, `db:seed`, `db:check`) under `backend/scripts/`, each a thin wrapper that `require`s from `dist/` and drives the same repository/use-case classes the running app uses. The one exception is bootstrapping the very first ADMIN account: today that's a hand-typed `INSERT` run ad hoc in a Railway console, which was needed because `CreateUserUseCase` (added by the `admin-user-management` change) is only reachable through an ADMIN-gated HTTP endpoint, and there's no ADMIN yet on a fresh database. This gap surfaced directly while bootstrapping the staging/production admin accounts after that change shipped.

## Goals / Non-Goals

**Goals:**

- Let an operator create the first ADMIN account with one command, using the same validation, role assignment, and password hashing as the API path.
- Make the script safe to re-run (fails loudly on duplicate email; never silently overwrites a user).
- Fit the existing script conventions exactly (naming, `dist/` requires, exit-code behavior) so it needs no new operational knowledge.

**Non-Goals:**

- No interactive prompts — this is a scripted, env-var-driven tool for CI/console use, matching `db:seed`/`db:migrate`.
- No support for creating non-ADMIN users via this script — that's already covered by the API/UI (`user-management` capability); this script exists only to solve the bootstrap chicken-and-egg problem.
- No credential storage or rotation — the operator supplies `ADMIN_PASSWORD` at run time and is responsible for it, same as any other manually-provisioned credential today.

## Decisions

- **Reuse `CreateUserUseCase` rather than writing a raw `INSERT`**: constructs `new CreateUserUseCase(new MariaDbUserRepository(), new NodePasswordHasher(appConfig.passwordHashIterations))` and calls `execute({ name, email, role: Roles.ADMIN, password })`. This guarantees the created row's password hash, `status`, and validation rules never drift from what `POST /api/v1/users` produces — the two paths share one implementation, not two that could diverge.
- **Env-var-driven, not argv-driven**: reads `ADMIN_NAME` (defaults to `'Administrador'`), `ADMIN_EMAIL` (required), `ADMIN_PASSWORD` (required) from `process.env`, matching how `CORS_ALLOWED_ORIGINS`, `JWT_SECRET`, etc. are already configured per environment in Railway/local `.env`. Missing `ADMIN_EMAIL`/`ADMIN_PASSWORD` fails fast with a clear message before touching the database.
- **Script placement and wiring**: `backend/scripts/create-admin.mjs`, wired as `"db:create-admin": "npm run build && node scripts/create-admin.mjs"` in `backend/package.json`, identical shape to `db:seed`/`db:migrate`. No `--workspace` changes needed since it's invoked the same way from the repo root or from inside `backend/`.
- **Failure handling**: `EmailAlreadyExistsError` and `InvalidUserInputError` thrown by `CreateUserUseCase` are caught and printed as a clear one-line message (not a stack trace) with `process.exitCode = 1`, mirroring `check-database.mjs`'s `formatError` pattern; unexpected errors (e.g. DB unreachable) print the raw error and also exit 1.

## Risks / Trade-offs

- [`ADMIN_PASSWORD` passed via env var is visible in shell history / process list for the duration of the run] → Accepted: this matches how every other secret (`JWT_SECRET`, `DB_PASSWORD`) is already handled in this project's environments; not a new risk class.
- [Running the script twice with the same email after the first admin already exists] → Handled: `CreateUserUseCase` checks for an existing user by email and throws `EmailAlreadyExistsError`, so the script exits 1 with a clear "already exists" message rather than creating a duplicate or silently doing nothing.
- [Script only creates ADMIN role, so it can't be repurposed for bootstrapping other roles] → Accepted per Non-Goals: once the first ADMIN exists, every other user (including additional admins) goes through the already-shipped `/users` API/UI.

## Migration Plan

1. Add the script and `package.json` entry; no database schema changes.
2. Update `docs/release/deployment-environments.md` and `docs/release/staging-deployment-checklist.md` to reference `npm run db:create-admin --workspace backend` for first-admin bootstrap, replacing the manual `INSERT` instructions.
3. No rollback concerns — this only adds a script, it doesn't change runtime behavior of the deployed app.

## Open Questions

- None blocking.
