## Context

The web frontend (`frontend/`) is a React 18 + TypeScript + Vite SPA structured as `app/` (composition root, layouts, providers, router), `features/*` (auth, cattle, dashboard, alerts, events, metrics), and `shared/*` (components, hooks, services, types, utils). It was scaffolded in one "project foundation" commit that pre-created every folder with a `README.md` stub, per `knowledge-base/04-architecture/screaming-architecture.md`. Subsequent feature commits filled in `auth`, `cattle`, `dashboard`, `alerts` but left `app/router`, `features/events`, `features/metrics`, `shared/hooks`, `shared/types`, and `shared/utils` empty, and never updated stale README text in folders that were later implemented.

Concrete symptoms confirmed by audit:

- `react-router-dom@^7` is an installed, unused dependency; `App.tsx` hand-rolls path matching, `pushState`/`popstate` handling, and inline role checks (`hasAnyRole(...)`) instead of using `app/router/` or the existing `ProtectedRoute` component consistently.
- `ADR-004` mandates TanStack Query for remote server state, but only `useDashboardMetrics` follows it — `CattleListPage`, `CattleDetailPage`, `AlertsListPage`, `AlertDetailPage` each hand-roll an near-identical `useEffect`/`useState` fetch/loading/error pattern.
- `ApiEnvelope<T>` is redefined in `alerts.api.ts`, `cattle.api.ts`, `dashboard.api.ts`, `auth.api.ts` instead of living once in `shared/types`.
- `formatDateTime` is duplicated in `CattleDetailPage.tsx` and `AlertsListPage.tsx` instead of living in `shared/utils`.
- `features/events` and `features/metrics` are empty except for a roadmap-referencing `README.md`; `metrics` may be redundant with what `dashboard` already renders.

Constraints: MVP-stage codebase, small team, no dedicated frontend architecture owner yet. Changes must not alter observable user behavior (routes, auth gating, displayed data) — this is a structural/internal-quality change, not a feature change.

## Goals / Non-Goals

**Goals:**

- Replace hand-rolled routing/auth-branching in `App.tsx` with declarative routing via `react-router-dom`, using `ProtectedRoute` uniformly for role gating.
- Bring all remote-data-fetching call sites in line with ADR-004 by introducing a shared TanStack Query hook convention and migrating the four non-compliant pages to it.
- Consolidate `ApiEnvelope<T>` and `formatDateTime` (and any other cross-feature duplicate found during implementation) into `shared/types` and `shared/utils` respectively, removing the per-feature duplicates.
- Make every top-level `app/*`, `features/*`, and `shared/*` folder either contain real implementation or an explicit, roadmap-linked justification (accurate README, not leftover "Phase 1" scaffold text).
- Resolve the ambiguity between `features/metrics` and `features/dashboard` (decide: keep both with distinct scope, merge, or defer `metrics` explicitly).

**Non-Goals:**

- No new user-facing features. `features/events` and `features/metrics` UI implementation is out of scope — only their placeholder status/documentation is addressed.
- No change to backend APIs, mobile, or desktop clients.
- No adoption of the deeper per-feature layering (`components/hooks/pages/services/types/utils` subfolders) described in `frontend-feature-guide.md` — at current MVP scale the flat feature-folder structure is retained; this design does not mandate restructuring existing feature internals beyond what's needed for the fixes above.
- No visual/UX redesign.

## Decisions

**1. Routing: adopt `react-router-dom` declarative routes instead of removing the dependency.**
Alternative considered: rip out `react-router-dom` and formalize the hand-rolled matcher instead, since it currently "works." Rejected because it already violates OCP (`App.tsx:34-58`'s ternary chain) and the dependency is already paid for (bundle size, install) but unused — keeping it unused is strictly worse than using it. Routes will be declared in `app/router/` (the existing empty placeholder), each route mapped to a feature's page component, with role gating applied via a single `ProtectedRoute`-wrapping convention rather than inline `hasAnyRole` checks scattered in `App.tsx`.

**2. Data fetching: introduce one shared hook convention (`shared/hooks`) built on TanStack Query, migrate call-sites one at a time.**
Alternative considered: leave the four hand-rolled pages as-is and only enforce the convention for new code going forward. Rejected because the duplication is already causing drift (only `dashboard` got it right) and the fix is small, isolated per page, and low risk. Migration is incremental (one page per task) rather than a single big-bang change, so each can be verified independently.

**3. Shared types/utils: promote existing duplicated code verbatim first, refactor call sites second.**
Move `ApiEnvelope<T>` to `shared/types` and `formatDateTime` to `shared/utils` as direct extractions (no behavior change), then update each `*.api.ts`/page to import from the shared location and delete the local copy. This keeps each step independently verifiable (extract → verify unchanged behavior → rewire imports → delete duplicate).

**4. `features/events` and `features/metrics`: resolve via documentation decision, not code.**
Alternative considered: implement stub UI now to "fill" the folders. Rejected — no product requirement exists yet for either feature (confirmed against `knowledge-base/10-roadmap/`), and implementing UI without a real requirement would itself violate YAGNI. Instead: correct `features/metrics/README.md` and `features/dashboard/README.md` to state explicitly whether `metrics` is superseded by `dashboard` or still planned separately (a product/roadmap decision, captured as an Open Question below), and correct `features/events/README.md` to reference the specific roadmap phase without implying Phase-1 scope.

**5. Scope boundary: do not adopt full per-feature Clean Architecture layering now.**
Alternative considered: restructure every feature into `domain/application/infrastructure/presentation` subfolders per `frontend-feature-guide.md`, matching the MAUI clients' Core/UI separation. Rejected for this change — at current feature count and team size, the added indirection isn't justified yet (YAGNI), and doing so would blow up the diff size of what is meant to be a targeted cleanup. This is captured as a follow-up decision, not silently dropped (see Open Questions).

## Risks / Trade-offs

- [Risk] Refactoring `App.tsx` routing could regress auth-gating behavior (e.g., a role check silently dropped) → Mitigation: migrate route-by-route with a smoke-test pass (manual or automated) confirming each protected route still redirects/blocks correctly before removing the old ternary branch for it.
- [Risk] Migrating four pages to TanStack Query changes loading/error UI timing subtly (query cache vs. per-mount fetch) → Mitigation: migrate one page at a time, compare loading/error/empty states against current behavior before moving to the next.
- [Risk] Deciding to merge/retire `features/metrics` could conflict with unstated product plans → Mitigation: flag as an explicit open question for product/roadmap owner sign-off before deleting or repurposing the folder; do not delete unilaterally during implementation.
- [Trade-off] Not adopting deeper per-feature layering now means this change doesn't fully close the gap with `frontend-feature-guide.md` → accepted for scope control; tracked as a follow-up rather than silently ignored.

## Migration Plan

1. Add `app/router/` route declarations and rewire `App.tsx` to use them; verify each route/role combination manually against current behavior; remove the old inline matcher once parity is confirmed.
2. Introduce a shared TanStack Query hook in `shared/hooks`; migrate `CattleListPage`, `CattleDetailPage`, `AlertsListPage`, `AlertDetailPage` one at a time, verifying loading/error/data states after each.
3. Extract `ApiEnvelope<T>` to `shared/types`, rewire the four `*.api.ts` files, delete local copies.
4. Extract `formatDateTime` to `shared/utils`, rewire `CattleDetailPage.tsx` and `AlertsListPage.tsx`, delete local copies.
5. Update README text in `app/layouts`, `app/providers`, `features/auth`, `features/alerts`, `features/dashboard` to reflect actual implemented state.
6. Resolve and document the `features/metrics` vs. `dashboard` question; update `features/events/README.md` and `features/metrics/README.md` accordingly.

No production data migration or rollback plan is needed — this is a frontend source-code-only, non-breaking structural change. Rollback is a standard git revert if a regression surfaces.

## Open Questions

- Is `features/metrics` still planned as a distinct capability from `dashboard`, or should it be merged/retired? Needs product/roadmap owner input before folder disposition is finalized.
- Should the deeper per-feature layering from `frontend-feature-guide.md` be formally adopted in a future change, or should that guide be updated to match the flatter structure this change preserves? Not decided here; flagged for a follow-up proposal.
