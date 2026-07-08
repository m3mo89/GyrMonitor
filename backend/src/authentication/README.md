# Authentication Module

Implements login and access control for the rest of the backend.

- `POST /auth/login` — authenticates with email/password, returns a JWT and user info; `400` for missing/malformed credentials, `401` for invalid credentials.
- `JwtAuthenticationGuard` — reusable guard applied to protected controllers to require a valid JWT.
- `RoleAuthorizationGuard` / `@RolesAllowed(...)` — reusable role-based authorization guard used by other modules (dashboard, user-management, alerts, etc.).
- Roles (`backend/src/authentication/domain/role.ts`): `ADMIN`, `FIELD_OPERATOR`, `RESEARCHER`, `SYSTEM_GENERATOR`.

See `knowledge-base/05-api/authentication.md` and `knowledge-base/04-architecture/security-architecture.md` for the full contract and rationale.
