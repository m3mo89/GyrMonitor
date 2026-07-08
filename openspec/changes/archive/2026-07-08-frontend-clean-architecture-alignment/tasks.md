## 1. Architecture Audit

- [x] 1.1 Audit `frontend/src/features/*` and classify each feature as `layer now`, `keep flat`, or `placeholder/deferred` using the complexity threshold from `design.md`.
- [x] 1.2 Record the chosen frontend feature folder convention in the relevant README or architecture guide so implementers know when to use `domain/application/infrastructure/presentation`.
- [x] 1.3 Identify all current imports where presentation code imports feature API adapters, endpoint details, browser storage, or infrastructure functions directly.
- [x] 1.4 Identify all feature domain/type files that currently import React, router APIs, TanStack Query, browser APIs, or HTTP client code.

## 2. User Management Layering

- [x] 2.1 Create `domain`, `application`, `infrastructure`, and `presentation` folders under `frontend/src/features/user-management/`.
- [x] 2.2 Move user-management domain language, role/status-facing types, and reusable validation helpers into `domain` without changing behavior.
- [x] 2.3 Move TanStack Query list and mutation orchestration into `application`, keeping query keys and invalidation behind narrow feature operations.
- [x] 2.4 Move concrete HTTP API functions and backend response mapping into `infrastructure`.
- [x] 2.5 Move `UserListPage` and any extracted form/table view components into `presentation`, ensuring pages call application hooks instead of API adapters.
- [x] 2.6 Update `app/router` imports for the new user-management presentation entry point.

## 3. Existing Feature Alignment

- [x] 3.1 Apply the same dependency-rule audit to `features/auth`, especially session storage, auth API calls, provider composition, and route guards.
- [x] 3.2 Promote `features/auth` to layered folders where needed, keeping route guard/UI code in presentation, session orchestration in application, and storage/API adapters in infrastructure.
- [x] 3.3 Audit `features/alerts`, `features/cattle`, and `features/dashboard` for page-to-API coupling and promote any feature that meets the complexity threshold.
- [x] 3.4 Keep simple read-only features flat only when the audit confirms they do not mix API endpoint details, reusable business language, and UI rendering in violation of the dependency rule.
- [x] 3.5 Update feature README files so their documented structure matches the implemented folder layout.

## 4. Shared Boundary Cleanup

- [x] 4.1 Verify `frontend/src/shared/` contains only reused cross-feature utilities, app-wide infrastructure, shared UI state components, or generic services.
- [x] 4.2 Move any feature-specific logic found in `shared/` back into its owning feature layer.
- [x] 4.3 Keep generic query helpers in `shared/hooks` only when they remain feature-agnostic and do not encode business behavior.

## 5. Verification

- [x] 5.1 Run the frontend typecheck/test suite after each feature migration and fix import or behavior regressions before moving to the next feature.
- [x] 5.2 Verify protected routes still enforce the same role access after any route import or presentation entry-point changes.
- [x] 5.3 Verify user-management create, disable, reactivate, reset-password, loading, error, and empty states remain behaviorally unchanged.
- [x] 5.4 Run `openspec validate frontend-clean-architecture-alignment --strict` and fix any spec/task formatting issues.
