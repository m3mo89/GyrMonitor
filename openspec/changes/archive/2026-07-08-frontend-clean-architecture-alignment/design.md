## Context

The current web frontend is a React 18 + TypeScript + Vite SPA. Its top-level structure already communicates intent better than a framework-first layout:

```text
frontend/src/
  app/
  features/
  shared/
```

The previous `frontend-architecture-alignment` work also addressed several first-order issues: routing now uses `react-router-dom`, shared query helpers exist, `ApiEnvelope` lives under `shared/types`, and formatting helpers can live under `shared/utils`.

The remaining gap is inside feature folders. Current implemented features commonly use a flat shape such as:

```text
features/user-management/
  UserListPage.tsx
  useUsers.ts
  users.api.ts
  users.types.ts
```

That is acceptable for very small MVP screens, but it does not fully express Clean Architecture once a feature owns mutations, validation, business-facing orchestration, or multiple screens. For example, `UserListPage.tsx` currently combines form state, validation messages, mutation decisions, data rendering, and page composition; `useUsers.ts` mixes application-facing use cases with TanStack Query and auth-context access; `users.api.ts` is a concrete HTTP adapter sitting beside presentation files. The result is readable today, but it does not give future contributors a clear place for domain rules, application ports, adapters, and UI-only concerns.

This design aligns the frontend with the repo's approved architecture guidance:

- `knowledge-base/04-architecture/clean-architecture.md`: dependencies point inward toward domain/application rules.
- `knowledge-base/04-architecture/screaming-architecture.md`: group by feature first, then by technical layer inside the feature.
- `knowledge-base/09-guides/frontend-feature-guide.md`: UI components should not implement business rules, remote state should use TanStack Query, and API calls should live in feature services or shared API clients.

## Goals / Non-Goals

**Goals:**

- Make frontend feature boundaries explicit enough for Clean Architecture, SOLID, and Screaming Architecture to be reviewable.
- Define a standard layered feature shape for complex features:

```text
features/<feature>/
  domain/
  application/
  infrastructure/
  presentation/
```

- Preserve the existing domain-first top-level feature names (`auth`, `dashboard`, `cattle`, `alerts`, `user-management`) instead of moving code into global `components/`, `hooks/`, `api/`, or `pages/` folders.
- Refactor incrementally, starting with the highest-coupling feature (`user-management`) and using it as the local pattern for later features.
- Preserve user-facing behavior, routes, backend API contracts, and current visual design.

**Non-Goals:**

- No frontend code changes are made as part of this proposal turn.
- No new UI screens, API endpoints, backend behavior, or database changes.
- No rewrite to a different state-management or routing stack.
- No attempt to force empty or placeholder features into layered folders before they have real behavior.
- No duplication of backend business rules in the browser; backend remains authoritative for security and domain invariants.

## Decisions

**1. Use feature-first Clean Architecture, not global technical folders.**

Each business feature remains the first organizing unit. Technical layers are nested inside the feature:

```text
features/user-management/
  domain/
  application/
  infrastructure/
  presentation/
```

Alternative considered: create global `domain/`, `application/`, `infrastructure/`, and `presentation/` folders under `frontend/src`. Rejected because it hides the business capabilities and contradicts the project's Screaming Architecture guidance.

**2. Treat frontend "domain" as client-side domain language, not backend authority.**

Frontend domain files may contain role labels, UI-safe feature types, client-side value helpers, and validation that improves UX. They must not become a second source of truth for authorization, password policy, alert severity, risk scoring, or persistence rules that the backend owns.

Alternative considered: mirror every backend entity and invariant in frontend domain folders. Rejected because it invites drift and weakens the backend-as-authority boundary.

**3. Application layer owns feature orchestration and ports.**

Feature application code should expose hooks/use-cases such as `useUserManagement`, `useCreateUser`, or query/mutation factories. It may depend on domain types and abstract ports, but concrete HTTP details and browser storage stay outside. In React, TanStack Query usage can live in application hooks because it represents remote application state orchestration, but the HTTP call itself remains behind a port implemented by infrastructure.

Alternative considered: put all TanStack Query hooks under `shared/hooks`. Rejected because feature query keys, invalidation, and mutations are feature behavior; only generic helper primitives belong in `shared`.

**4. Infrastructure layer implements adapters.**

HTTP clients, DTO-to-domain mapping, browser storage adapters, and concrete API implementations belong under `infrastructure`. Existing `*.api.ts` files should move there when a feature is promoted to the layered shape.

Alternative considered: rename `*.api.ts` files to `services/` only. Rejected because "services" is too vague for Clean Architecture review; `infrastructure` makes the adapter role explicit.

**5. Presentation layer is UI-only.**

Pages, route adapter components, view components, and form components belong under `presentation`. They can call application hooks and render domain/application data, but must not instantiate API clients, know endpoint paths, define cross-feature types, or implement business decisions beyond immediate interaction state.

Alternative considered: leave pages at the feature root and only move API files. Rejected because the root would remain a mixed bag and the architecture would still be hard to review.

**6. Use a complexity threshold instead of forced ceremony.**

A feature must adopt layered folders when it has any of the following: mutations, meaningful client-side validation, multiple pages, browser/storage adapters, route-level orchestration, or business-facing calculations. Small read-only screens may stay flat temporarily, but new behavior should trigger promotion.

Alternative considered: refactor every feature immediately. Rejected because a big-bang restructuring increases import churn and risk without changing behavior.

## Risks / Trade-offs

- [Risk] File movement can create noisy diffs and broken imports. -> Mitigation: migrate one feature at a time, run typecheck/tests after each, and avoid behavior edits in the same step.
- [Risk] Developers may overfill `domain/` with backend rules. -> Mitigation: spec language explicitly limits frontend domain to client-safe language and UX validation; backend remains authoritative.
- [Risk] Layering may feel heavy for very small features. -> Mitigation: use the complexity threshold and allow simple read-only features to remain flat until needed.
- [Risk] `shared/` could become a dumping ground during extraction. -> Mitigation: only promote code to shared when used by multiple features or when it is truly app-wide infrastructure.
- [Trade-off] This proposal prioritizes structure and maintainability over fastest possible feature delivery for future screens. The payoff is lower coupling as admin and operations features grow.

## Migration Plan

1. Add the new `web-frontend-architecture` delta requirements.
2. During implementation, audit each current feature and classify it as `layer now`, `keep flat`, or `placeholder/deferred`.
3. Promote `features/user-management/` first because it has list, create, disable/reactivate, reset-password mutations, client validation, and admin-only route behavior.
4. For each promoted feature, create `domain`, `application`, `infrastructure`, and `presentation` folders, move files without behavior changes, and update imports.
5. Split page-level logic only where it clarifies boundaries: forms/components into `presentation`, query/mutation orchestration into `application`, API adapters into `infrastructure`, and feature types/validation helpers into `domain`.
6. Repeat for `auth`, `alerts`, `cattle`, and `dashboard` only where their current complexity meets the threshold.
7. Run frontend tests/typecheck after each feature migration.

Rollback is a normal git revert because no data migrations or external contracts are changed.

## Open Questions

- Should the project standardize the exact names `domain/application/infrastructure/presentation` for frontend features, or keep the older `components/hooks/pages/services/types/utils` guide for simple features and reserve Clean Architecture names for complex ones?
- Should route adapter components live in `app/router` or inside each feature's `presentation/routes` folder and be imported by the app router? The first implementation should pick one pattern and document it.
