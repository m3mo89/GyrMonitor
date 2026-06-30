## Context

GyrMonitor has the Phase 1 project foundation in place and now needs the Phase 2 authentication baseline before protected MVP modules can be implemented. The source of truth is `knowledge-base/`, especially:

- `knowledge-base/10-roadmap/phase-2-authentication.md`
- `knowledge-base/05-api/authentication.md`
- `knowledge-base/04-architecture/security-architecture.md`
- `knowledge-base/08-decisions/ADR-007-jwt-route-guards.md`
- `knowledge-base/07-reference/roles-and-permissions.md`
- `knowledge-base/07-reference/dto-catalog.md`
- `knowledge-base/05-api/error-model.md`
- `knowledge-base/06-engineering/backend/modules.md`
- `knowledge-base/06-engineering/frontend/routing.md`
- `knowledge-base/06-engineering/frontend/state-management.md`

The current repository contains authentication feature/module placeholders only. This change turns those placeholders into the minimum reusable auth foundation needed by later backend modules and the web frontend.

## Goals / Non-Goals

**Goals:**

- Implement a backend authentication module with user identity, password hashing/verification, JWT login, JWT validation, and reusable guards.
- Return the documented login DTO shape and standardized error envelopes.
- Centralize role definitions so later modules can declare authorization consistently.
- Add a frontend login page, session state, route protection, access-denied behavior, logout/session cleanup, and HTTP `Authorization: Bearer <token>` handling.
- Provide focused unit/integration/UI tests for the foundation acceptance criteria in the Phase 2 roadmap.

**Non-Goals:**

- Build user registration, user administration, password reset, refresh tokens, MFA, account lockout, audit trails, or full production identity management.
- Apply final role policies to every future domain endpoint before those endpoints exist.
- Implement mobile or desktop authentication flows beyond preserving compatible API/session contracts for future clients.
- Introduce production secrets, real credentials, or real operational user data.

## Decisions

1. Keep authentication as a screaming-architecture module.

   Backend implementation will live under the `authentication` capability boundary and expose reusable primitives to other modules. Domain/application code should own login behavior and role concepts, while NestJS controllers/guards adapt HTTP and framework concerns.

   Alternative considered: place auth in a generic shared/security folder. This was rejected because the Knowledge Base lists `authentication` as a business capability and later work should be able to find login, JWT validation, and roles by capability name.

2. Use JWT access tokens only for the MVP foundation.

   Login will issue a signed JWT containing user identity and role claims plus an expiration. Protected requests will use `Authorization: Bearer <token>`, and invalid or expired tokens will return `UNAUTHORIZED`.

   Alternative considered: add refresh tokens immediately. This was deferred because ADR-007 and Phase 2 require a JWT route-guard foundation, while refresh tokens add storage, rotation, revocation, and threat-model work outside this small change.

3. Make backend authorization authoritative.

   Frontend route guards and hidden UI actions improve user experience, but backend authentication and role guards are the source of truth for access control. Role checks will use the approved role matrix from `knowledge-base/07-reference/roles-and-permissions.md`.

   Alternative considered: rely on frontend route gating until domain endpoints exist. This was rejected because later modules need reusable backend guards before exposing protected APIs.

4. Use safe local user seeding or test fixtures without committing secrets.

   The implementation should provide a deterministic way to authenticate in local/test environments without committing production passwords. Passwords must be hashed at rest and never returned by the API.

   Alternative considered: hard-code an admin credential in source. This was rejected because it conflicts with the security and configuration guidance.

5. Centralize frontend session and token handling.

   The frontend will keep session state as a cross-cutting concern, attach tokens through the shared API client, clear session state on logout or 401, and redirect unauthenticated users to `/login`.

   Alternative considered: pass tokens through individual feature calls. This was rejected because later modules would duplicate security behavior and drift from ADR-007.

## Risks / Trade-offs

- [Risk] Token storage can expose the session if the browser is compromised. -> Mitigation: store only the minimum session data, never store credentials, and keep token handling centralized so the strategy can evolve.
- [Risk] Seed/test credentials can accidentally become production assumptions. -> Mitigation: keep them environment-scoped, documented, and excluded from production configuration.
- [Risk] Role checks may be too coarse for future needs. -> Mitigation: implement the approved role model now and leave fine-grained permissions as a future improvement.
- [Risk] Login error messages can leak account validity. -> Mitigation: use the standardized error envelope and a generic invalid-credentials response.

## Migration Plan

This is the first authentication implementation, so no existing auth behavior needs migration. Implementation should add non-secret configuration keys for JWT signing and expiration, add local/test user setup, and update frontend environment examples only as needed.

Rollback consists of removing the authentication module implementation, frontend auth workflow, and related configuration/test additions. No production user data migration is expected.

## Open Questions

- Which exact persistence adapter should back MVP users during implementation if the current backend foundation does not yet include database integration?
- What token lifetime should be used for local MVP development before production security settings are finalized?
- Should `SYSTEM_GENERATOR` receive a human login path in this change, or remain reserved for future system-client credentials as implied by the Knowledge Base?
