## Why

The backend currently relies on smoke scripts and build checks, but lacks automated tests that directly exercise business use cases and HTTP controllers. Adding real unit and e2e coverage now reduces regression risk as persistence, authentication, cattle, activity events, and observations continue evolving.

## What Changes

- Add a backend test capability covering real unit tests for application use cases with deterministic fake repositories and services.
- Add HTTP e2e tests around NestJS controllers using the actual request pipeline, guards, DTO mapping, and error handling where practical.
- Add test scripts and configuration so the backend can run unit tests, e2e tests, and the combined default test command from `backend/package.json`.
- Keep tests isolated from MariaDB by default; database-backed checks remain explicit smoke/integration commands.
- Document the expected minimum test scenarios for current MVP modules.

## Capabilities

### New Capabilities
- `backend-test-suite`: Automated backend unit and e2e tests for use cases and controllers.

### Modified Capabilities

## Impact

- Affected code: `backend/package.json`, backend test configuration, `backend/src/**/*.spec.ts`, and `backend/test/**/*.e2e-spec.ts`.
- Affected modules: authentication, cattle monitoring, activity events, and inspections/observations.
- Dependencies: likely adds a TypeScript-capable test runner and Nest HTTP testing utilities if not already present.
- Systems: local development and CI validation can use the new test scripts without requiring MariaDB.
