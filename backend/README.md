# Backend Foundation

This folder contains the NestJS-oriented backend foundation for GyrMonitor.

Source guidance:

- `knowledge-base/06-engineering/backend/overview.md`
- `knowledge-base/07-reference/directory-map.md`
- `knowledge-base/05-api/authentication.md`
- `knowledge-base/04-architecture/security-architecture.md`
- `knowledge-base/07-reference/roles-and-permissions.md`

The current backend includes the Phase 2 authentication foundation: local/test users, password hashing, JWT login, reusable authentication guard, and reusable role guard. Domain modules beyond authentication remain future work.

## Local Authentication

Use local-only credentials for development and tests. They are intentionally documented as non-production examples:

- `admin@gyrmonitor.local` / `local-admin-password`
- `researcher@gyrmonitor.local` / `local-researcher-password`

Configure JWT and hashing with `.env.example` keys. Do not commit production secrets or real user credentials.

## Commands

```sh
npm run dev --workspace backend
npm run start --workspace backend
npm run smoke:http --workspace backend
npm run build --workspace backend
npm run lint --workspace backend
npm run format:check --workspace backend
npm run test --workspace backend
```

The development command starts the Nest runtime locally. The smoke command builds the backend, starts the compiled HTTP server on a test port, and verifies the public availability endpoint at `/api/v1`.
