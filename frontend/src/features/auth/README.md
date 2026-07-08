# Auth Feature Boundary

Implemented: login form, session storage, the injected `ApiClient` used by other features, and the `ProtectedRoute` guard that gates authentication and per-route roles for `app/router`. `SystemGeneratorMessage` covers the non-interactive `SYSTEM_GENERATOR` integration account.

```text
domain/          Roles, authenticated user, login DTOs and session type
application/     Login/session orchestration and authenticated API client creation
infrastructure/  Login HTTP adapter and browser session store
presentation/    Provider, login page, protected route and integration-account message
```
