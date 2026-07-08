## Why

Today the only way to provision a GyrMonitor user is the `db:seed` script, which writes four hardcoded demo accounts and must never run in production. There is no way for an admin to create a real user, no way to revoke a compromised or former user's access (disabling is preferred over deleting so their historical activity/observations stay attributable), and no way to recover a user who forgot their password. This blocks safe production user provisioning and day-to-day account lifecycle management.

## What Changes

- Add an account `status` (`ACTIVE` / `DISABLED`) to the user identity model and `users` table. Users are never hard-deleted; "removing" a user means disabling them.
- Add ADMIN-only backend endpoints to create a user, list users (with role and status), disable a user, reactivate a disabled user, and reset a user's password.
- The login flow rejects disabled users using the same standardized unauthorized response already used for invalid credentials, so a disabled account's status is not distinguishable from a wrong password to the caller.
- Add an ADMIN-only "User management" page in the web frontend to list users and perform create / disable / reactivate / reset-password actions.
- An admin cannot disable their own account (avoids accidental lockout with no other admin available).

## Capabilities

### New Capabilities
- `user-management`: ADMIN-only capability to create users, list users, disable/reactivate a user's access, and reset a user's password, via both API and a web UI.

### Modified Capabilities
- `authentication`: the user identity model gains an account status field, and the login endpoint gains a requirement that disabled users are rejected with the existing standardized unauthorized response.

## Impact

- **Backend**: extends `backend/src/authentication/domain/user.ts` (add `status`), `UserRepository` interface and its MariaDB adapter, and `login.use-case.ts` (reject disabled users). Adds a new `user-management` module (or extends `authentication`) with use-cases for create/list/disable/reactivate/reset-password, an ADMIN-gated controller using the existing `RolesAllowed`/`RoleAuthorizationGuard` pattern, and reuses `NodePasswordHasher`. New migration adds the `status` column to `users`.
- **Frontend**: new `frontend/src/features/user-management/` feature (list page + action dialogs, `users.api.ts`, `useUsers.ts` query hooks) following the existing feature-folder and TanStack Query conventions, plus a new route wrapped in `ProtectedRoute` restricted to `Roles.ADMIN`.
- **Docs/process**: `docs/release/deployment-environments.md` and the staging/production provisioning guidance can point to this capability instead of the seed script for creating real users.
