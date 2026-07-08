## Context

The backend is organized around NestJS controllers, application use cases, domain objects, and repository interfaces. Current validation relies on build checks, smoke scripts, and manual API checks, while `backend/package.json` does not define real unit or e2e test commands. This leaves business behavior such as login validation, idempotent activity event registration, cattle lookups, and alert observations under-tested.

The change affects multiple modules and introduces a repeatable testing pattern for future backend work. Tests must run locally without MariaDB by default and must verify actual use case/controller behavior rather than only script presence.

## Goals / Non-Goals

**Goals:**

- Add a backend test runner and scripts for unit, e2e, and combined test execution.
- Cover application use cases with deterministic fakes for repositories, token services, hashers, clocks, and ID generation.
- Cover controllers through Nest HTTP e2e tests that exercise routing, guards, success envelopes, pagination envelopes, and error envelopes.
- Keep default tests isolated from MariaDB and external services.
- Make the pattern easy to extend for future backend modules.

**Non-Goals:**

- Replace smoke scripts for database or deployed HTTP checks.
- Require a real MariaDB instance for the default test command.
- Rework production module architecture beyond small injection/testability improvements needed to avoid hard-wired singletons in e2e tests.
- Add frontend, mobile, or desktop tests.

## Decisions

1. Use a TypeScript-capable test runner with Nest-compatible HTTP testing.

Vitest is a good fit because it runs TypeScript tests quickly, provides built-in mocks/assertions, and can coexist with the current TypeScript build. Supertest or Nest's HTTP adapter testing support should be used for e2e controller requests. Alternative considered: Jest, which is common in NestJS but adds heavier configuration and is not already present.

1. Split tests by level and command.

Unit tests should live near the code they verify as `*.spec.ts`, focused on application use cases and pure error branches. E2e tests should live under `backend/test/**/*.e2e-spec.ts`, focused on HTTP behavior through a Nest testing module. Scripts should expose `test:unit`, `test:e2e`, and `test`, with `test` running both levels.

1. Prefer dependency injection or overridable factories for controller e2e tests.

Several controllers currently call module-level singleton use cases. To test controllers without MariaDB, implementation may either refactor controllers to receive use cases through Nest providers or introduce narrowly scoped test seams that preserve production behavior. The preferred direction is constructor injection through module providers because it matches Nest patterns and avoids brittle module mocking.

1. Keep repositories fake and deterministic in unit tests.

Use in-memory fake repositories and explicit fake services instead of MariaDB, filesystem state, or real clocks. Tests should assert saved entities, idempotency, error mapping, and response DTOs. This keeps unit tests fast and makes failures explain business regressions.

1. Validate HTTP contracts at controller boundaries.

E2e tests should assert status codes and response bodies for success, validation errors, not found errors, unauthorized requests, forbidden requests, and pagination where applicable. They should also verify role restrictions for protected routes using controlled auth guard behavior or signed test tokens.

## Risks / Trade-offs

- Controller singletons are hard to replace in tests -> Prefer constructor injection with provider tokens and keep production modules wiring the same concrete use cases.
- Adding a runner may increase dependency footprint -> Keep dev dependencies limited to the runner, Nest testing utilities if missing, and HTTP request test utilities.
- E2e tests can become slow or flaky -> Avoid real database/network dependencies and use deterministic fakes.
- Guard tests can overfit implementation details -> Test representative unauthorized/forbidden paths at HTTP level and keep full guard behavior covered separately with focused unit tests where useful.
- Refactoring controllers for injection can touch multiple modules -> Limit changes to provider wiring and preserve existing routes/responses.
