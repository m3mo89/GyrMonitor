## Why

The web frontend (`frontend/`) was bootstrapped in a single "project foundation" commit that pre-created the full Screaming Architecture skeleton (`features/*`, `shared/*`) with `README.md` placeholder stubs in every folder. Later feature work (auth, cattle, dashboard, alerts) filled in some folders but left others empty (`app/router`, `features/events`, `features/metrics`, `shared/hooks`, `shared/types`, `shared/utils`) and never updated the stale "placeholder" wording in folders that *were* implemented. As a result the codebase now diverges from its own documented architecture: routing is hand-rolled in `App.tsx` while `react-router-dom` sits unused and `app/router/` stays empty; 4 of 5 data-fetching call sites bypass the project's own ADR-004 (TanStack Query) decision with duplicated fetch/loading/error boilerplate; and a shared response envelope type and date-formatting util are copy-pasted across four feature modules instead of living once in the empty `shared/types` and `shared/utils` folders. This proposal defines the structural requirements needed to close that gap and gives the team a concrete, trackable plan to either implement or deliberately retire each placeholder.

## What Changes

- Define explicit architecture requirements for the web frontend covering: Screaming Architecture folder conventions, routing (declarative router config instead of hand-rolled path matching in `App.tsx`), consistent use of TanStack Query for all remote server state per ADR-004, and consolidation of cross-cutting types/utilities into the `shared/` layer.
- Require every scaffolded folder to either contain real implementation or an explicit, roadmap-linked justification (e.g., in the technical-debt register) — no orphaned `README.md`-only folders left over from initial scaffolding with stale "Phase 1" wording.
- Require feature-folder documentation (`README.md`) to reflect actual implementation status, not leftover scaffold text.
- Consolidate the duplicated `ApiEnvelope<T>` type and `formatDateTime` utility into `shared/types` and `shared/utils`, and migrate `CattleListPage`, `CattleDetailPage`, `AlertsListPage`, `AlertDetailPage` to a shared TanStack Query hook instead of hand-rolled `useEffect`/`useState` fetch logic.
- Replace the hand-rolled path-matching/role-check logic in `App.tsx` with declarative routing (using the already-installed `react-router-dom`) and centralize authorization checks through the existing `ProtectedRoute` component instead of duplicating role logic inline.
- Decide and record the fate of the empty `features/events` and `features/metrics` folders (keep as roadmap-linked scaffolding with corrected documentation, merge `metrics` into `dashboard` if redundant, or remove until scheduled) — no code implementation for these features is in scope of this change.
- **No behavior change** for end users; this is an internal structural/architecture alignment change. No new UI, no API changes.

## Capabilities

### New Capabilities

- `web-frontend-architecture`: Structural and architectural requirements for the `frontend/` web application — Screaming Architecture folder conventions, routing approach, shared cross-cutting code placement, data-fetching consistency (ADR-004), and rules preventing orphaned placeholder folders/stale documentation.

### Modified Capabilities

(none — existing feature capabilities such as `dashboard`, `cattle-management`, `alerts`, `authentication` are not changing observable behavior; only internal implementation structure is affected, which is covered by the new `web-frontend-architecture` capability rather than by editing their specs)

## Impact

- **Affected code**: `frontend/src/app/App.tsx`, `frontend/src/app/router/`, `frontend/src/shared/{hooks,types,utils}/`, `frontend/src/features/{cattle,alerts}/*Page.tsx`, `frontend/src/features/{events,metrics}/README.md`, README files under `frontend/src/app/{layouts,providers}` and `frontend/src/features/{auth,alerts,dashboard}`.
- **Dependencies**: activates the already-installed but currently unused `react-router-dom` dependency; no new dependencies required.
- **Systems**: web frontend only (`frontend/`); no backend, mobile, or desktop client changes.
- **Risk**: low — internal refactor with no intended change to user-facing behavior; primary risk is regressions in routing/auth-guard behavior during the `App.tsx` refactor, to be covered by tests before/after.
