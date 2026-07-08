# User Management Module

Implements ADMIN-only administration of user accounts.

- `POST /users` (`ADMIN`) — create a user.
- `GET /users` (`ADMIN`) — list every user.
- `POST /users/:id/disable` / `POST /users/:id/reactivate` (`ADMIN`) — change a user's status without deleting the record; an ADMIN cannot disable their own account.
- `POST /users/:id/reset-password` (`ADMIN`) — set a new password for a user.

`backend/scripts/create-admin.mjs` (`npm run db:create-admin --workspace backend`) bootstraps the first `ADMIN` using the same validation, role assignment, and password hashing as `POST /users`.

See `knowledge-base/05-api/user-management.md` for the full contract.
