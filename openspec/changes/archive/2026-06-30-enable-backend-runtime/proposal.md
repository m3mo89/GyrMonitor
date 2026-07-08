## Why

The backend currently contains Nest-oriented modules and HTTP controllers, but its entrypoint is still a non-listening placeholder and the package scripts only run structural checks. We need a real local runtime so developers can start the API, verify the configured HTTP surface, and catch wiring regressions before frontend or integration work depends on it.

## What Changes

- Turn the backend entrypoint into a real NestJS application bootstrap that listens on the configured port.
- Add backend scripts for local development and production-style start flows.
- Add a repeatable HTTP smoke test that starts the backend and verifies it responds over HTTP.
- Keep existing domain module contracts intact while validating runtime composition through the application module.

## Capabilities

### New Capabilities

- `backend-runtime`: Runtime startup, HTTP availability, and local verification behavior for the Nest backend.

### Modified Capabilities

- None.

## Impact

- Affected code: `backend/src/main.ts`, backend package scripts, backend runtime/test support scripts, and any minimal runtime configuration needed to start Nest.
- Affected APIs: Adds a basic HTTP availability endpoint or equivalent response path suitable for smoke testing.
- Dependencies: May require Nest CLI or TypeScript runtime tooling needed for `dev` and `start` scripts.
- Systems: Local developer workflow and CI-style verification for backend HTTP startup.
