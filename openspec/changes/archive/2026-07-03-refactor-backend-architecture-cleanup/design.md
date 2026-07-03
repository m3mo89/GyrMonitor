## Context

The backend has 8 feature modules, each following domain/application/infrastructure/http layering internally (Clean Architecture respected *within* a module). As modules were added incrementally, three cross-cutting problems accumulated:

1. **Duplicated HTTP error mapping.** `cattle.controller.ts`, `alerts.controller.ts`, `dashboard.controller.ts`, `observations.controller.ts`, `activity-events.controller.ts`, and `offline-sync.controller.ts` each define an identical-shaped `type ApiSuccess`, `type ApiError`, `function apiError()`, and `function toHttpError()`.
2. **Misplaced shared primitives.** `assertUuid` and `assertIsoDateTime` are generic validators with no activity-event-specific logic, but they live in `activity-events/domain/activity-event.ts` and are imported by `alerts`, `dashboard`, and `offline-sync`.
3. **Cross-module infrastructure coupling.** `cattle-monitoring/infrastructure/cattle-singletons.ts` imports `activity-events/infrastructure/activity-event-singletons.ts`'s exported singleton, while `activity-events/infrastructure/activity-event-singletons.ts` imports `cattle-monitoring/infrastructure/cattle-repository-singleton.ts`'s exported singleton — a circular dependency between two business-capability modules. `alerts` similarly reaches directly into `cattle-monitoring`'s and `inactivity-analysis`'s singleton files instead of consistently using NestJS's `imports`/`exports` module mechanism (which `alerts.module.ts` already uses correctly for `InactivityAnalysisModule`).

This is a repo-local, internal-only change: no HTTP route, request/response shape, or status code may change as an observable side effect.

## Goals / Non-Goals

**Goals:**
- One shared kernel (`backend/src/shared/`) holding cross-cutting HTTP response types and generic validators, replacing duplicated code.
- One mechanism for mapping domain errors to HTTP responses, replacing the 6 duplicated `toHttpError()` implementations.
- No import cycle between business-capability modules.
- One consistent way modules obtain a dependency owned by another module: NestJS's DI container (`imports`/`exports`), not direct imports of another module's singleton file.
- Zero behavior change: existing unit tests keep passing unmodified in assertions (they may be updated only for import paths), and manual HTTP verification shows identical status codes/response shapes before and after.

**Non-Goals:**
- Not migrating repositories off the manual singleton pattern *within* a module (e.g. `sharedCattleRepository` used only inside `cattle-monitoring`) — that's a separate, larger concern (see Open Questions).
- Not changing the database schema, the HTTP contract, or adding new endpoints.
- Not addressing `backend/src/shared`'s eventual role beyond what this change needs (e.g. no shared logging/telemetry module yet).

## Decisions

- **Shared kernel location and contents:** `backend/src/shared/http/api-response.ts` (generic `ApiSuccess<T>`/`ApiError` types + a `mapDomainErrorToHttp()` helper or NestJS `ExceptionFilter`), and `backend/src/shared/validation/assertions.ts` (`assertUuid`, `assertIsoDateTime` moved from `activity-events/domain`). This matches the pre-existing README placeholder text ("Placeholder for shared backend primitives, configuration, and infrastructure helpers").
- **Error mapping mechanism: a global NestJS `ExceptionFilter`, not a shared function called manually per controller.** A `@Catch()` filter registered once in `main.ts` (`app.useGlobalFilters(new DomainErrorFilter())`) removes the need for every controller to `try/catch` and call `toHttpError()` — NestJS already propagates thrown domain errors up; the filter maps them to the correct HTTP status/envelope in one place. Controllers keep throwing the same domain errors they already throw; only the local `try/catch`+`toHttpError` boilerplate is deleted.
  - Alternative considered: a shared `toHttpError()` function still called manually from each controller. Rejected — it removes the duplicated *code* but not the duplicated *call site*, and still requires every new controller to remember to call it.
  - **Refined during implementation:** rather than the filter importing all 10 concrete domain error classes (`InvalidCattleIdError`, `CattleNotFoundError`, `AlertNotFoundError`, etc.) into a lookup table, `shared/domain/domain-error.ts` defines an abstract `DomainError extends Error` base class carrying `httpStatus`/`code`. Every domain error class now extends `DomainError` and declares its own status/code via its constructor. The filter only imports `DomainError` — one type, not ten — and reads `exception.httpStatus`/`exception.code` directly. This avoids the shared kernel depending on every feature module's application layer, which would have reintroduced the same kind of reverse-coupling this change exists to remove. `HttpException` instances (thrown by guards and by `authentication.controller.ts`, which are out of scope for this change) pass through unchanged; anything else becomes a generic 500 `INTERNAL_ERROR`.
- **Breaking the cattle-monitoring ⟷ activity-events cycle:** `activity-events` already conceptually depends on `cattle-monitoring` (an activity event always references a cattle ID; `RegisterActivityEventUseCase` needs to check the cattle exists). `cattle-monitoring`'s only reason to depend on `activity-events` is `GetCattleHistoryUseCase`, which reads activity-event history for one animal. Decision: keep `activity-events → cattle-monitoring` as the one allowed direction (it matches the natural domain dependency), and change `cattle-monitoring`'s `GetCattleHistoryUseCase` to receive its `ActivityEventRepository` port via NestJS DI (module `imports`/`exports`) instead of importing `activity-events`'s singleton file directly. Concretely: `ActivityEventsModule` exports `ActivityEventRepository`'s provider token; `CattleMonitoringModule` imports `ActivityEventsModule` and injects it through Nest's container into `GetCattleHistoryUseCase`, instead of `cattle-singletons.ts` importing `sharedActivityEventRepository` via a raw JS import.
  - Alternative considered: move `GetCattleHistoryUseCase` into the `activity-events` module (since it queries activity-event history). Rejected — the use case's primary responsibility is answering "history for this animal," which conceptually belongs to `cattle-monitoring`'s public surface (`GET /cattle/:id/events` is a cattle-monitoring controller route); moving the whole use case would be a bigger, riskier change than fixing the wiring direction.
- **DI standardization:** modules that need another module's use case or repository declare it through `@Module({ imports: [OtherModule], exports: [...] })` and constructor injection (as `AlertsModule` already does for `InactivityAnalysisModule`), instead of importing the other module's `*-singletons.ts` file directly. Each module's *own* internal repository singleton (e.g. `cattle-repository-singleton.ts` used only inside `cattle-monitoring`) is unaffected — this decision only governs *cross-module* access.

## Risks / Trade-offs

- [Exception filter doesn't reproduce a controller's exact status code or error code for some edge case] → Mitigation: tasks.md requires building a mapping table from the current 6 controllers' `toHttpError()` implementations before writing the filter, and running the full unit test suite (and a manual smoke check per module) after each controller is migrated, one module at a time — not a single big-bang cutover.
- [Moving `assertUuid`/`assertIsoDateTime` breaks an import somewhere not caught by grep] → Mitigation: `tsc --noEmit` catches any broken import immediately since these are used as value imports, not just types.
- [Changing cattle-monitoring/activity-events wiring accidentally changes NestJS provider scope/lifecycle (e.g. singleton vs request-scoped)] → Mitigation: keep using `useValue`-style singleton providers through the module `exports`, matching the existing pattern already used by `AlertsModule`/`InactivityAnalysisModule`, so provider lifecycle doesn't change — only *how* the reference is obtained changes (Nest DI vs raw import).

## Migration Plan

1. Build shared kernel (types + filter + validators) without touching any controller yet.
2. Migrate controllers to the shared error filter one at a time, running `npm run test:unit` and a manual `curl` smoke check for that module's routes after each.
3. Move `assertUuid`/`assertIsoDateTime` to `shared/validation`, update all import sites, run `tsc --noEmit`.
4. Fix the `cattle-monitoring` ⟷ `activity-events` wiring direction, run full test suite + `npm run build`.
5. Audit remaining cross-module singleton imports (`alerts` → `cattle-monitoring`, `alerts` → `inactivity-analysis`) and convert to Nest DI module imports/exports.
6. Full verification pass: `npm run build`, `npm run lint`, `npm run test`, plus manual `/api/docs` check (the OpenAPI docs added in `add-openapi-docs` are a convenient way to re-verify every route's status codes didn't shift).

Rollback: each step is an independent, revertible commit; if step N regresses behavior, revert just that commit — earlier steps remain valid since they don't depend on later ones.

## Open Questions

- Should the manual singleton pattern be replaced entirely by NestJS `useClass`/`useFactory` providers even for a module's *own* internal repository? Out of scope here (Non-Goals) — worth a follow-up change if the team wants full idiomatic Nest DI throughout, but not required to fix the concrete problems (duplication, circularity, mixed strategies) this change targets.
- **Discovered during implementation:** `activity-events` also raw-imports `generateAlertFromActivityEventUseCase` from `alerts/infrastructure/alert-singletons` (not listed in the original proposal/design). Converting it to Nest DI would require `ActivityEventsModule` to import `AlertsModule`, which — combined with `AlertsModule → CattleMonitoringModule → ActivityEventsModule` (established in this change) — would form a genuine 3-module Nest cycle. This reflects a real domain-level cycle (cattle-monitoring needs activity-event history; alerts need cattle tag lookups; activity-event registration needs to generate alerts), not just an infrastructure-wiring accident. Left as a directly-constructed singleton for now (documented inline). A future change could resolve this properly via `forwardRef()` or by extracting a narrower "cattle lookup" module that both `alerts` and `cattle-monitoring` depend on without depending on each other.
