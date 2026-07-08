## Why

The `knowledge-base/` (the project's designated "source of truth" per ADR-014), the root `README.md`/`FOUNDATION.md`, and several module-level `README.md` files still describe the project as being in early "Phase 1 / Foundation" with most domains as "future work." In reality, 26 OpenSpec changes have been implemented and archived (`openspec/changes/archive/`), covering authentication, cattle management, observations, activity events, alerts, dashboard, offline sync, desktop/mobile clients, staging deployment, admin user management, and Spanish UI localization. A three-part audit (backend, frontend/desktop/mobile, product/roadmap) confirmed the documentation has not been updated alongside this work, while `openspec/specs/*` (the capability spec tracker) is accurate and current. This leaves the knowledge base actively misleading for onboarding, AI-assisted development, and the developer-guide/definition-of-done workflows that depend on it.

## What Changes

- Replace stale "Phase 1 / coming soon / future work" status language in root `README.md`, `FOUNDATION.md`, `backend/README.md`, `backend/src/authentication/README.md`, `backend/src/inspections/README.md`, and `backend/src/dashboard/README.md` with accurate descriptions of currently implemented functionality.
- Add the missing `user-management` capability to the knowledge base: a new `knowledge-base/05-api/user-management.md`, DTO entries in `knowledge-base/07-reference/dto-catalog.md`, a row in `knowledge-base/02-domain/module-dependency-map.md`, and a `user-management` entry in `knowledge-base/04-architecture/screaming-architecture.md`'s frontend feature list.
- Document the frontend Clean Architecture layering (domain/application/infrastructure/presentation per feature) that already exists in code, and document Spanish UI localization (i18next + `.resx`), neither of which has any knowledge-base or ADR record today.
- Correct the `mobile/README.md` build command, which currently targets `net10.0-maccatalyst` (excluded from mobile per `restrict-client-target-platforms`) instead of the real `net10.0-android`/`net10.0-ios` targets, and add the missing `Shared/Authorization` folder to its feature list.
- Extend the roadmap docs (`knowledge-base/00-introduction/ROADMAP.md`, `knowledge-base/10-roadmap/README.md`, `knowledge-base/01-product/product-roadmap.md`) with a "post-MVP" phase entry covering the 12 changes archived after `stabilize-mvp-release` (OpenAPI docs, MAUI dedupe, desktop/mobile polish, platform restriction, architecture alignment, staging environment, admin user management, admin script, frontend clean-architecture alignment, i18n).
- Append the missing entries to `knowledge-base/RELEASE_NOTES.md` (nothing has been logged since the v1.1.0 docs freeze) and update `knowledge-base/00-introduction/AI_CONTEXT.md` to name `user-management` as a domain and note staging/i18n as live concerns.
- Fix `knowledge-base/00-introduction/PROJECT_STRUCTURE.md` to include `database/`, `scripts/`, and `shared/`, which exist at the repo root but are omitted.
- Introduce a lightweight documentation-governance capability spec that states the review cadence/trigger for keeping `knowledge-base/`, root docs, and READMEs synchronized with `openspec/changes/archive/`, so this drift does not silently recur.
- Produce a **V3** revision of the three academic deliverables in `docs/` (`DOC-01_GyrMonitor_..._Academico.docx`, `DOC-02_GyrMonitor_ADR_Frontend_..._Academico.docx`, `DOC-03_GyrMonitor_Contratos_Backend_..._Academico.docx`), which are currently dated to the pre-freeze V2.0 baseline (~2026-06-20) and therefore share the same gaps: missing `user-management`/admin endpoints and contracts, no ADR for frontend i18n, no mention of mobile/desktop target-platform restrictions or staging deployment. The existing V2 files are kept as-is (historical academic record); V3 files are added alongside them.

This is a documentation-only change: no application behavior, API, or schema changes.

## Capabilities

### New Capabilities
- `documentation-governance`: requirements for keeping `knowledge-base/`, root READMEs, and module READMEs synchronized with implemented OpenSpec changes, including who/when documentation updates happen relative to a change being archived.

### Modified Capabilities
(none — no existing spec's requirements/behavior changes; this change only corrects narrative documentation to match capabilities that are already accurately captured in `openspec/specs/user-management`, `openspec/specs/ui-localization`, `openspec/specs/mobile-client`, etc.)

## Impact

- Affected files: root `README.md`, `FOUNDATION.md`, `backend/README.md`, `backend/src/{authentication,inspections,dashboard}/README.md`, `mobile/README.md`, `knowledge-base/00-introduction/{ROADMAP.md,AI_CONTEXT.md,PROJECT_STRUCTURE.md}`, `knowledge-base/01-product/product-roadmap.md`, `knowledge-base/02-domain/module-dependency-map.md`, `knowledge-base/04-architecture/{screaming-architecture.md,clean-architecture.md}`, `knowledge-base/05-api/{README.md,user-management.md (new)}`, `knowledge-base/07-reference/dto-catalog.md`, `knowledge-base/10-roadmap/README.md`, `knowledge-base/RELEASE_NOTES.md`.
- New files: `docs/DOC-01_GyrMonitor_V3_Academico.docx`, `docs/DOC-02_GyrMonitor_ADR_Frontend_V3_Academico.docx`, `docs/DOC-03_GyrMonitor_Contratos_Backend_V3_Academico.docx` (existing V2 files untouched).
- No code, API, or database changes; no deploy/runtime impact.
- New spec: `openspec/specs/documentation-governance/spec.md`.
