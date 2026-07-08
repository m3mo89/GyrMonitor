## 1. Root-level status docs

- [x] 1.1 Update root `README.md` "Project Status" table to reflect that all MVP phases plus post-MVP work (desktop/mobile, staging, admin, i18n) are implemented, not "Pending"/"In Progress"
- [x] 1.2 Update root `README.md` "Repository Structure" block to remove "(coming soon)" from `backend/`, `frontend/`, `mobile/`, `desktop/`
- [x] 1.3 Update `FOUNDATION.md` to remove "Phase 1: Foundation" / skeleton-placeholder framing now that business modules are implemented

## 2. Backend module READMEs

- [x] 2.1 Rewrite `backend/README.md` to remove "domain modules beyond authentication remain future work" and list the actual implemented modules (dashboard, cattle-monitoring, alerts, inspections, offline-sync, activity-events, inactivity-analysis, user-management)
- [x] 2.2 Reference `backend/scripts/create-admin.mjs` (`npm run db:create-admin`) in `backend/README.md`'s production/provisioning section
- [x] 2.3 Replace Phase-1 placeholder text in `backend/src/authentication/README.md` with a description of the implemented login endpoint, guards, and roles
- [x] 2.4 Replace Phase-1 placeholder text in `backend/src/inspections/README.md` with a description of the implemented observations controller/endpoints
- [x] 2.5 Replace Phase-1 placeholder text in `backend/src/dashboard/README.md` with a description of the implemented `GET /dashboard` endpoint and its query params
- [x] 2.6 (added during apply) `frontend/README.md` had the same "Phase 2 foundation... dashboards/cattle/alerts remain future work" staleness as the backend module READMEs, despite not being in the original file list — rewritten to list actually-implemented features. Also added a missing `backend/src/user-management/README.md` (every other backend module has one; this one didn't).

## 3. Knowledge base: user-management capability

- [x] 3.1 Create `knowledge-base/05-api/user-management.md` documenting the `/users` endpoints (create, list, disable, reactivate, reset-password), sourced from `openspec/specs/user-management/spec.md` and `backend/src/user-management`
- [x] 3.2 Add `user-management` to the module list/diagram in `knowledge-base/05-api/README.md` and `knowledge-base/05-api/overview.md`
- [x] 3.3 Add `UserSummaryDto`, `CreateUserRequestDto`, `ResetPasswordRequestDto` entries to `knowledge-base/07-reference/dto-catalog.md`
- [x] 3.4 Add a `user-management` row/node to `knowledge-base/02-domain/module-dependency-map.md`
- [x] 3.5 Add `user-management` to the frontend feature list in `knowledge-base/04-architecture/screaming-architecture.md`

## 4. Knowledge base: architecture and localization

- [x] 4.1 Add a section to `knowledge-base/04-architecture/clean-architecture.md` (or a new doc) describing the frontend's per-feature domain/application/infrastructure/presentation layering
- [x] 4.2 Add an ADR-style or architecture note documenting Spanish UI localization (i18next for frontend, `.resx` for desktop/mobile), referencing `openspec/specs/ui-localization/spec.md`

## 5. Mobile and desktop docs

- [x] 5.1 Fix `mobile/README.md` build command from `net10.0-maccatalyst` to the actual `net10.0-android`/`net10.0-ios` targets
- [x] 5.2 Add the `Shared/Authorization` folder to the feature list in `mobile/README.md`

## 6. Roadmap and release notes

- [x] 6.1 Extend `knowledge-base/00-introduction/ROADMAP.md`'s recommended implementation order with a "post-MVP" section listing the 12 changes archived after `stabilize-mvp-release`
- [x] 6.2 Apply the same post-MVP addition to `knowledge-base/10-roadmap/README.md` and `knowledge-base/01-product/product-roadmap.md`
- [x] 6.3 Append `knowledge-base/RELEASE_NOTES.md` entries covering all archived changes since the v1.1.0 docs freeze
- [x] 6.4 Update `knowledge-base/00-introduction/AI_CONTEXT.md` to name `user-management` as a domain and note staging deployment and i18n as live concerns
- [x] 6.5 Update `knowledge-base/00-introduction/PROJECT_STRUCTURE.md` to include `database/`, `scripts/`, and `shared/` in the repository layout

## 7. Academic DOCX documents (V3)

- [x] 7.1 Write a one-off `python-docx` script that reads each V2 `.docx` as a structural template and emits a V3 copy, preserving section numbering/layout
- [x] 7.2 DOC-01 (Requerimientos y Arquitectura): update/extend the C4 diagrams (§18) and any affected requirements sections to include the `user-management`/admin domain and offline-sync/staging notes already captured in `knowledge-base/04-architecture` and `knowledge-base/10-roadmap`
- [x] 7.3 DOC-02 (ADR Frontend): appended one new entry, ADR-016 (i18n), matching the knowledge-base's global ADR numbering (ADR-014/015 already exist and are non-frontend), plus its traceability matrix row. Frontend Clean Architecture layering was **not** given its own ADR — mirroring the knowledge-base decision (§4.1), it's documented as a "Nota V3" addendum under the existing ADR-003 (Feature Organization), since it's a refinement of that decision rather than an independent one.
- [x] 7.4 DOC-03 (Contratos Backend): add a new endpoints section for `/users` (create, list, disable, reactivate, reset-password) with the same contract-documentation style as the existing `/auth`, `/dashboard`, `/cattle`, `/events`, `/alerts`, `/sync` sections, sourced from `openspec/specs/user-management/spec.md`
- [x] 7.5 Save outputs as `docs/DOC-01_GyrMonitor_V3_Academico.docx`, `docs/DOC-02_GyrMonitor_ADR_Frontend_V3_Academico.docx`, `docs/DOC-03_GyrMonitor_Contratos_Backend_V3_Academico.docx`, leaving the V2 files untouched
- [x] 7.6 Update each V3 file's document-control table (Versión, Fecha) to reflect the V3 revision date

## 8. Validation

- [x] 8.1 Grep the updated knowledge-base files for leftover "Phase 1", "future work", and "coming soon" language tied to now-implemented modules, and confirm none remain
- [x] 8.2 Spot-check each rewritten doc against its `openspec/specs/*` counterpart (or source code where no spec exists) for accuracy
- [x] 8.3 Open each V3 `.docx` and confirm it renders correctly (valid OOXML) and that section numbering/cross-references between DOC-01/02/03 still make sense
