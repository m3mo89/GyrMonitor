## Why

An architecture review of the backend (Clean Architecture / Screaming Architecture / SOLID) found that layering is respected *within* each module (domain → application → infrastructure → http), but several cross-cutting issues have accumulated as modules were added: identical HTTP error-mapping boilerplate copied into 7 controllers, generic validation primitives (`assertUuid`, `assertIsoDateTime`) living inside the `activity-events` module's domain but consumed by unrelated modules, a circular dependency between `cattle-monitoring` and `activity-events` at the infrastructure layer, and two incompatible dependency-injection strategies coexisting (manual module-scope singletons vs. NestJS's own DI container). None of this is user-visible today, but it makes the codebase harder to extend safely and risks import-order bugs. This is the right time to fix it — before more modules are added on top of the same pattern.

## What Changes

- Populate `backend/src/shared/` with a real shared kernel: common HTTP response types (`ApiSuccess`/`ApiError`), a global NestJS exception filter that replaces the 7 duplicated `toHttpError()`/`apiError()` implementations, and generic domain-agnostic validators (`assertUuid`, `assertIsoDateTime`) moved out of `activity-events/domain`.
- Remove the per-controller `type ApiSuccess`, `type ApiError`, `apiError()`, and `toHttpError()` definitions from `cattle.controller.ts`, `alerts.controller.ts`, `dashboard.controller.ts`, `observations.controller.ts`, `activity-events.controller.ts`, and `offline-sync.controller.ts`, replacing them with the shared filter/types.
- Break the circular dependency between `cattle-monitoring` and `activity-events`: `cattle-monitoring/infrastructure/cattle-singletons.ts` currently imports `activity-events`' shared repository, while `activity-events/infrastructure/activity-event-singletons.ts` imports `cattle-monitoring`'s shared repository. Restructure so the dependency runs one direction only (design.md documents the direction and rationale).
- Standardize cross-module composition on NestJS's own DI container (`imports`/`exports`/providers) instead of hand-rolled singleton modules reaching into sibling modules' internals. Modules may keep an internal singleton for their *own* repository construction, but must stop importing another module's singleton file directly.
- No behavioral change: all existing HTTP routes, request/response shapes, status codes, and auth requirements stay identical.

## Capabilities

### New Capabilities

- `backend-architecture`: Internal, non-user-facing engineering requirements for the backend's module structure — a shared kernel for cross-cutting primitives, a single HTTP error-mapping mechanism, no circular dependencies between business-capability modules, and one consistent dependency-injection strategy. Modeled the same way `backend-test-suite` captures engineering requirements that aren't part of the public HTTP contract.

### Modified Capabilities

(none — existing capability specs describe external HTTP behavior, which does not change; this proposal only changes internal code organization)

## Impact

- Affected code: `backend/src/shared/**` (new content), all 7 controllers listed above, `cattle-monitoring/infrastructure/*`, `activity-events/infrastructure/*`, `alerts/infrastructure/*`, each module's `*.module.ts` (provider wiring), and `activity-events/domain/activity-event.ts` (removal of generic assertions).
- No changes to `backend/src/config`, database schema, or any HTTP contract — this is purely an internal restructuring covered by existing unit tests.
- Risk is regression in error-mapping behavior (wrong status code/error shape) if the shared exception filter doesn't replicate all 7 controllers' exact mappings; design.md addresses this with a mapping table and tasks.md sequences it module-by-module with test verification at each step.
