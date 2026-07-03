## 1. Declarative routing

- [x] 1.1 Define route configuration in `frontend/src/app/router/` using `react-router-dom`, mapping each existing path (`/login`, `/dashboard`, `/cattle`, `/cattle/:id`, `/alerts`, `/alerts/:id`, etc.) to its existing page component
- [x] 1.2 Wrap protected routes with the existing `ProtectedRoute` component for role gating, replacing inline `hasAnyRole(...)` ternary checks in `App.tsx`
- [x] 1.3 Rewire `App.tsx` to render the router configuration instead of the hand-rolled path-matching/`pushState`/`popstate` logic
- [x] 1.4 Manually verify each route (authenticated/unauthenticated, authorized/unauthorized role) behaves the same as before the change
- [x] 1.5 Remove the old path-matching logic and any now-unused `pushState`/`popstate` handling from `App.tsx`

## 2. Consistent data fetching

- [x] 2.1 Add a shared TanStack Query hook convention under `frontend/src/shared/hooks` (e.g., a `useApiQuery` wrapper or documented query-key pattern) modeled on the existing `useDashboardMetrics` implementation
- [x] 2.2 Migrate `CattleListPage` to the shared query hook; verify loading/error/empty/data states match current behavior
- [x] 2.3 Migrate `CattleDetailPage` to the shared query hook; verify loading/error/data states match current behavior
- [x] 2.4 Migrate `AlertsListPage` to the shared query hook; verify loading/error/empty/data states match current behavior
- [x] 2.5 Migrate `AlertDetailPage` to the shared query hook; verify loading/error/data states match current behavior

## 3. Shared types and utilities

- [x] 3.1 Extract `ApiEnvelope<T>` into `frontend/src/shared/types` and update `alerts.api.ts`, `cattle.api.ts`, `dashboard.api.ts`, `auth.api.ts` to import it, deleting the per-file duplicates
- [x] 3.2 Extract `formatDateTime` into `frontend/src/shared/utils` and update `CattleDetailPage.tsx` and `AlertsListPage.tsx` to import it, deleting the per-file duplicates (also deduplicated the identical copy found in `AlertDetailPage.tsx`)

## 4. Placeholder folder resolution and documentation accuracy

- [x] 4.1 Update `frontend/src/app/layouts/README.md` and `frontend/src/app/providers/README.md` to describe the actual implemented contents instead of stale "Placeholder for future..." text
- [x] 4.2 Update `frontend/src/features/auth/README.md`, `frontend/src/features/alerts/README.md`, `frontend/src/features/dashboard/README.md` to describe actual implemented workflows instead of stale "Phase 1" scaffold text
- [x] 4.3 Get product/roadmap decision on whether `features/metrics` is superseded by `features/dashboard` or remains a distinct planned capability; update `frontend/src/features/metrics/README.md` and `frontend/src/features/dashboard/README.md` to reflect the decision — no distinct roadmap item exists for a standalone metrics feature (confirmed against `knowledge-base/10-roadmap/` and ADR-009), so both READMEs now document that `features/metrics` is recommended as superseded by `features/dashboard`, pending explicit product sign-off before deletion
- [x] 4.4 Update `frontend/src/features/events/README.md` to reference its specific roadmap phase (per `knowledge-base/10-roadmap/phase-5-activity-events.md`) instead of generic "Phase 1" wording
- [x] 4.5 Confirm no remaining folder under `frontend/src/app`, `frontend/src/features`, or `frontend/src/shared` contains only a stale/inaccurate `README.md` — also fixed `shared/components/README.md` and `shared/services/README.md`, which were stale despite having real implementations

## 5. Verification

- [x] 5.1 Run the frontend lint/typecheck/test/build commands and confirm they pass — also ran the root `npm run verify` (backend + frontend format/lint/test/build, 84 backend tests + 8 frontend tests) and the frontend's own (unwired) `node scripts/check-foundation.mjs test` text-assertion checks; all green
- [x] 5.2 Manually exercise login, dashboard, cattle list/detail, and alerts list/detail flows in the browser to confirm no behavior regression from the routing and data-fetching changes — done with a headless Chromium session (Playwright, installed in an isolated scratch dir, not added to the project) driving the real `vite dev` build with mocked `/api/v1/**` responses. 27/27 checks passed: unauthenticated root shows LoginPage; login redirects to `/dashboard`; dashboard/cattle-list/cattle-detail/alerts-list/alert-detail all render with TanStack Query data; cattle/alert detail route params resolve correctly; back/forward and cross-feature navigation (alert -> cattle) work; the alert status mutation updates the UI without a reload; unknown paths render the 404 page and its recovery action works; logout returns to LoginPage **and** the URL correctly updates to `/login` (confirms the `useNavigate()` fix actually fixed the raw-`history.replaceState` desync bug); `FIELD_OPERATOR` is denied on `/dashboard`, has its nav link hidden, and can still reach `/alerts`; `SYSTEM_GENERATOR` sees the integration-account message regardless of route. Zero console/page errors during the admin flow.
