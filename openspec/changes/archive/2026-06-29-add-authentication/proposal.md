## Why

GyrMonitor needs the Phase 2 authentication foundation before MVP modules can safely expose protected resources or role-specific workflows. This change implements the small authentication baseline described by `knowledge-base/10-roadmap/phase-2-authentication.md` while keeping the Knowledge Base as the source of truth for detailed requirements.

## What Changes

- Add backend authentication capability for the user identity model, password verification, JWT login, JWT validation, reusable authentication guard, and reusable role guard.
- Add the public `POST /api/v1/auth/login` endpoint aligned with `knowledge-base/05-api/authentication.md`.
- Add role definitions and authorization behavior aligned with `knowledge-base/07-reference/roles-and-permissions.md`.
- Add frontend login workflow, session state, protected-route behavior, and centralized HTTP token handling aligned with `knowledge-base/06-engineering/frontend/routing.md`, `knowledge-base/06-engineering/frontend/state-management.md`, and ADR-007.
- Add tests and verification coverage for valid login, invalid credentials, protected endpoint access, role denial, and frontend token/session behavior.
- Exclude refresh tokens, user administration screens, registration, password reset, multi-factor authentication, audit logging, and complete domain-module authorization policies beyond reusable guard support.

## Capabilities

### New Capabilities

- `authentication`: JWT-based login, authenticated user session handling, protected backend resources, role-based authorization primitives, and frontend login/session foundation.

### Modified Capabilities

None.

## Impact

- Affects backend authentication module boundaries under `backend/src/authentication/`, shared security primitives, configuration examples, and test setup.
- Affects frontend auth feature boundaries under `frontend/src/features/auth/`, router guards, session provider/state, API client token attachment, and 401 cleanup behavior.
- Introduces or updates dependency/configuration needs for JWT signing, password hashing, and safe non-production seed/admin credential setup.
- References detailed behavior in `knowledge-base/05-api/authentication.md`, `knowledge-base/04-architecture/security-architecture.md`, `knowledge-base/08-decisions/ADR-007-jwt-route-guards.md`, `knowledge-base/07-reference/dto-catalog.md`, and `knowledge-base/05-api/error-model.md` instead of duplicating those requirements here.
