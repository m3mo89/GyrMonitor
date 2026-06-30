## Context

The backend has NestJS dependencies, an `AppModule`, feature modules, controllers, and configuration, but `backend/src/main.ts` only references the module and exits without creating or listening with a Nest application. Backend package scripts also run placeholder validation checks instead of exposing real development or start commands.

This change converts the existing scaffold into a runnable HTTP process while keeping the current Clean Architecture boundaries and in-memory/local feature implementations intact. The runtime should be simple enough for local development and CI smoke verification, without introducing database migrations or production deployment automation.

## Goals / Non-Goals

**Goals:**

- Bootstrap a real NestJS application from `AppModule`.
- Respect the existing backend configuration for port and API prefix.
- Provide discoverable `dev` and `start` scripts for the backend workspace.
- Provide a smoke test that starts the backend, performs an HTTP request, and fails if the runtime cannot serve traffic.
- Keep the smoke check deterministic and lightweight for local and CI-style execution.

**Non-Goals:**

- Replace local repositories with a real database connection.
- Add full end-to-end coverage for every domain route.
- Introduce production process management, containers, or deployment scripts.
- Change authentication, cattle, observation, or activity-event business behavior beyond what is necessary for runtime wiring.

## Decisions

1. Bootstrap with NestFactory in `backend/src/main.ts`.

   Rationale: the project already depends on `@nestjs/core` and `@nestjs/platform-express`, so the runtime should use the standard Nest application factory. This validates decorators, dependency injection, module imports, guards, and controllers through the same path developers will run locally.

   Alternative considered: keep a custom Node HTTP server for the smoke endpoint. That would prove less about the actual backend composition and leave Nest wiring untested.

2. Keep `/api/v1` as the global prefix and expose a minimal root health response under that prefix.

   Rationale: `appConfig.apiPrefix` already defines `/api/v1`, and a deterministic health-style route gives the smoke test a stable endpoint that does not require credentials or seed data. Existing protected domain routes remain protected.

   Alternative considered: smoke-test a protected business route. That would require token generation and fixture data, increasing test fragility for a runtime-only check.

3. Use package scripts that separate development, compiled start, and smoke verification.

   Rationale: developers need a watch/dev command, a production-style command that runs built output, and a one-shot smoke command. Keeping them in `backend/package.json` makes workspace commands discoverable from both the backend folder and root npm workspaces.

   Alternative considered: only add root scripts. That would hide backend-specific runtime commands from developers working inside `backend/`.

4. Implement the smoke test as a Node script that owns process startup and HTTP polling.

   Rationale: a self-contained script can start the backend on a configurable test port, wait until the endpoint responds, assert status/body, and clean up the child process. This avoids requiring a separate terminal or pre-running server in CI.

   Alternative considered: document a manual curl check. That would be useful for humans but would not provide a repeatable automated guard.

## Risks / Trade-offs

- Runtime dependencies may reveal incomplete provider wiring in feature modules -> Use the real `AppModule` so failures surface early and can be fixed where composition is broken.
- A smoke endpoint could become accidental product API surface -> Keep it minimal, versioned with the API prefix, and documented as availability-only behavior.
- Dev tooling adds dependencies -> Prefer standard Nest/TypeScript tooling already aligned with the project rather than introducing a parallel runtime stack.
- Child-process smoke tests can leave a process behind on failure -> Ensure the script terminates the child process in success, failure, and timeout paths.

## Migration Plan

- Replace the placeholder bootstrap with a NestFactory-based listener.
- Add a minimal public availability controller or endpoint wired through `AppModule`.
- Add backend scripts for `dev`, `start`, and `smoke:http`, preserving existing verification scripts.
- Add the smoke script and include it in backend verification where appropriate.
- Rollback by restoring the placeholder bootstrap and removing the runtime scripts/smoke script if the runtime enablement is backed out.
