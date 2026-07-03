# Auth Feature Boundary

Implemented: login form, session storage (`AuthProvider`, `session-store`), the injected `ApiClient` used by every other feature, and the `ProtectedRoute` guard that gates authentication and per-route roles for `app/router`. `SystemGeneratorMessage` covers the non-interactive `SYSTEM_GENERATOR` integration account.
