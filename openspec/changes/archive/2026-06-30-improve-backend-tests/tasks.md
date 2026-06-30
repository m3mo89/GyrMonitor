## 1. Test Runner Setup

- [x] 1.1 Add backend dev dependencies for a TypeScript test runner, Nest testing utilities, and HTTP request assertions.
- [x] 1.2 Add backend test configuration for unit specs in `src/**/*.spec.ts` and e2e specs in `test/**/*.e2e-spec.ts`.
- [x] 1.3 Update `backend/package.json` with `test:unit`, `test:e2e`, and `test` scripts that execute real test suites.
- [x] 1.4 Ensure test TypeScript configuration does not conflict with the production `rootDir: "src"` build.

## 2. Testability Wiring

- [x] 2.1 Introduce provider tokens or constructor injection for authentication, cattle, activity-event, and observation controller use cases.
- [x] 2.2 Update production Nest modules to bind the same concrete use cases currently used by controller singletons.
- [x] 2.3 Add shared test helpers for creating Nest testing apps with controlled auth/role behavior and fake use case providers.

## 3. Unit Tests

- [x] 3.1 Add `LoginUseCase` unit tests for successful login, missing credentials, normalized email lookup, and invalid credentials.
- [x] 3.2 Add cattle use case unit tests for listing pagination defaults/limits, detail success/not found, and history success/not found.
- [x] 3.3 Add `RegisterActivityEventUseCase` unit tests for successful registration, duplicate event ID idempotency, invalid input, and missing cattle.
- [x] 3.4 Add activity-event listing unit tests for filters, pagination defaults/limits, and invalid query handling.
- [x] 3.5 Add observation use case unit tests for adding observations, duplicate observation ID idempotency, invalid input, missing alert, and listing observations.

## 4. Controller E2e Tests

- [x] 4.1 Add authentication controller e2e tests for successful login, validation failure, invalid credentials, and response envelopes.
- [x] 4.2 Add cattle controller e2e tests for unauthenticated access, forbidden role access, list success with pagination, detail success/not found, and history success/not found.
- [x] 4.3 Add activity-events controller e2e tests for unauthenticated access, forbidden role access, create success/idempotency/error mapping, and list success with pagination.
- [x] 4.4 Add observations controller e2e tests for unauthenticated access, forbidden role access, create success/error mapping, and list success/not found.
- [x] 4.5 Verify e2e tests use fake providers and do not connect to MariaDB by default.

## 5. Verification

- [x] 5.1 Run `npm run build` in `backend` and fix TypeScript or wiring regressions.
- [x] 5.2 Run `npm run test:unit` in `backend` and ensure all unit tests pass.
- [x] 5.3 Run `npm run test:e2e` in `backend` and ensure all e2e tests pass.
- [x] 5.4 Run `npm run test` in `backend` and ensure the combined command runs both real suites.
- [x] 5.5 Run `openspec validate improve-backend-tests --strict` and resolve any specification issues.
