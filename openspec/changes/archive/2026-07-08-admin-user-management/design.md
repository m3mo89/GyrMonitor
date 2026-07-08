## Context

Users today are provisioned by `backend/src/database/seeds.ts` (four hardcoded ADMIN/RESEARCHER/FIELD_OPERATOR/SYSTEM_GENERATOR accounts), which is explicitly documented as unsafe for production. The `User` domain type (`backend/src/authentication/domain/user.ts`) has no status field, so there is no way to represent "this account should no longer be able to log in" short of deleting the row — which would orphan any activity events, observations, or alerts attributed to that user id. The backend already has an ADMIN-capable role-authorization primitive (`RolesAllowed`/`RoleAuthorizationGuard`) used by other modules (cattle, alerts, dashboard, observations), and a hexagonal structure (`application` use-cases depending on port interfaces, `infrastructure` adapters implementing them) established by the `authentication` module's `LoginUseCase` and `MariaDbUserRepository`.

## Goals / Non-Goals

**Goals:**
- Let an ADMIN create a real user (name, email, role, initial password) through the API and a web page.
- Let an ADMIN list all users with their role and status.
- Let an ADMIN disable a user's login access and reactivate it later, without deleting the row.
- Let an ADMIN reset a user's password when they can't log in and self-service recovery doesn't exist.
- Make the login flow reject disabled users indistinguishably from invalid credentials.

**Non-Goals:**
- Self-service signup, password reset, or profile editing by non-admins — out of scope.
- Role reassignment (changing an existing user's role) — the user explicitly excluded this from scope; a disabled+recreated user is the workaround if a role truly needs to change.
- Hard delete of users — intentionally disallowed to preserve referential integrity of historical records.
- Audit log / history of admin actions — not requested; can be a future capability.
- Email delivery of credentials/passwords — the admin communicates the initial/reset password out of band (matches how `db:seed` passwords are already communicated).

## Decisions

- **Status representation**: add `status: 'ACTIVE' | 'DISABLED'` to the `User` domain type and a `status ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE'` column via a new migration, defaulting existing rows to `ACTIVE`. Considered a nullable `disabled_at` timestamp instead; rejected because an explicit enum is easier to extend later (e.g. a future `PENDING` state) and matches the existing enum-based `role` column style.
- **Module placement**: implement as a new `backend/src/user-management/` module (its own `application`/`infrastructure`/`http` folders) rather than growing the `authentication` module further, since `authentication` owns login/session concerns while this owns user lifecycle CRUD. It depends on the same `UserRepository` port, extended with the new methods below, so the MariaDB adapter is shared rather than duplicated.
- **Repository port extension**: extend `UserRepository` (currently used only by `LoginUseCase`) with `create`, `findAll`, `updateStatus`, `updatePasswordHash`. `MariaDbUserRepository` implements the additions; login's existing `findByEmail` behavior is unchanged.
- **Login rejects disabled users**: `LoginUseCase.execute` checks `user.status === 'DISABLED'` after credential verification and throws the same `InvalidCredentialsError` used for wrong password, so the HTTP layer returns the identical standardized `UNAUTHORIZED` response — a disabled account is not distinguishable from a wrong password to the caller.
- **Self-disable guard**: `DisableUserUseCase` compares the target user id against the authenticated caller's id (available from the JWT-authenticated request) and rejects disabling yourself with a validation error, preventing an admin from locking themselves out with no other admin able to reactivate them.
- **Password reset delivery**: `ResetPasswordUseCase` accepts an admin-supplied new password (not a generated token/link) and hashes it with the existing `NodePasswordHasher`, mirroring how initial passwords are set at creation. No email/notification integration exists in this codebase to build on, and adding one is out of scope.
- **Endpoint shape**: new `UserManagementController` at `POST /api/v1/users`, `GET /api/v1/users`, `POST /api/v1/users/:id/disable`, `POST /api/v1/users/:id/reactivate`, `POST /api/v1/users/:id/reset-password`, all guarded by `@RolesAllowed(Roles.ADMIN)` plus the existing JWT auth guard — following the same guard-stacking pattern already used on `cattle.controller.ts`.
- **Frontend placement**: new `frontend/src/features/user-management/` feature following the existing `features/cattle/` shape (`UserListPage.tsx`, `users.api.ts`, `users.types.ts`, `useUsers.ts` TanStack Query hooks for list + mutations for create/disable/reactivate/reset), routed at an ADMIN-only path wrapped in the existing `ProtectedRoute` with `allowedRoles={[Roles.ADMIN]}`.

## Risks / Trade-offs

- [Admin-supplied passwords may be weak] → Reuse existing password validation rules from login/seed conventions (non-empty, minimum length) at the use-case boundary; full password-strength policy is out of scope for this change but the validation hook is in place for a future tightening.
- [No audit trail of who disabled/created/reset whom] → Accepted for this change since it wasn't requested; the `updated_at` column on `users` at least shows *when* a row last changed. Flagged as a natural follow-up capability.
- [Self-disable guard only blocks disabling *yourself*, not the "last remaining admin"] → Accepted: a second ADMIN account should exist per environment as an operational practice; enforcing "last admin" is more complex (requires a live count query) and wasn't requested.
- [Extending `UserRepository` touches a port already depended on by `LoginUseCase`] → Mitigate by additive-only interface changes (new methods, no signature changes to `findByEmail`) and running existing authentication unit/e2e tests after the change.

## Migration Plan

1. Add migration `<timestamp>_add_user_status.sql` adding the `status` column with `DEFAULT 'ACTIVE'`, so existing rows (including seeded demo users) remain enabled with no manual backfill.
2. Ship backend (repository, use-cases, controller) and run `db:migrate` in each environment before relying on the new endpoints.
3. Ship frontend feature behind the existing ADMIN route guard; no feature flag needed since access is already role-gated.
4. No rollback complexity beyond standard migration rollback; disabling is non-destructive so there's no data-loss risk to reverse.

## Open Questions

- None blocking; role reassignment and audit history are explicitly deferred per the Non-Goals above.
