## ADDED Requirements

### Requirement: Knowledge base reflects the latest archived change

The `knowledge-base/` documentation SHALL describe the system's current implemented state, not a historical snapshot. Whenever an OpenSpec change is archived under `openspec/changes/archive/`, any `knowledge-base/` file whose subject matter (domain, API, architecture, or roadmap) is affected by that change SHALL be updated in the same change or a directly-following documentation change, before the next unrelated change is archived.

#### Scenario: A change adds or modifies a capability with an API surface

- **WHEN** a change is archived that adds or changes a backend/frontend capability with an API surface (e.g. new controller, new DTOs, new frontend feature)
- **THEN** the corresponding `knowledge-base/05-api/*.md`, `knowledge-base/02-domain/*.md`, and `knowledge-base/07-reference/dto-catalog.md` entries are created or updated to describe it

#### Scenario: A change alters architecture or cross-cutting structure

- **WHEN** a change is archived that changes module/feature layering, target platforms, or localization (e.g. Clean Architecture restructuring, i18n rollout, target-framework restriction)
- **THEN** `knowledge-base/04-architecture/*.md` and the relevant `README.md` files under `backend/`, `frontend/`, `desktop/`, or `mobile/` are updated to match, and no `README.md` continues to state Phase-1/placeholder language for a module that has since been implemented

### Requirement: Roadmap and release notes track the full change history

`knowledge-base/00-introduction/ROADMAP.md`, `knowledge-base/10-roadmap/README.md`, `knowledge-base/01-product/product-roadmap.md`, and `knowledge-base/RELEASE_NOTES.md` SHALL enumerate every phase of work actually implemented, including work beyond the original MVP phase list, and SHALL NOT stop at an earlier milestone (e.g. `stabilize-mvp-release`) once further changes have been archived.

#### Scenario: A post-MVP change is archived

- **WHEN** a change is archived after the original MVP roadmap phases are complete
- **THEN** `knowledge-base/RELEASE_NOTES.md` gains an entry describing it, and the roadmap documents' phase list is extended to reference it (directly or via a "post-MVP" grouping)

### Requirement: Root-level status documents are not stale

Root `README.md` and `FOUNDATION.md` project-status indicators (e.g. phase labels, "coming soon" markers, proposal/MVP status) SHALL match the actual archived-change history in `openspec/changes/archive/` at the time the documents are read.

#### Scenario: Reader checks project status in root README

- **WHEN** a reader opens the root `README.md` "Project Status" section or repository structure listing
- **THEN** the section accurately reflects which modules (backend, frontend, mobile, desktop) are implemented rather than labeling implemented modules as pending or "coming soon"

### Requirement: Academic deliverables track major reconciliation passes

The versioned academic `.docx` deliverables in `docs/` (DOC-01 Requerimientos y Arquitectura, DOC-02 ADR Frontend, DOC-03 Contratos de Servicio Backend) SHALL be revised into a new version whenever a documentation-governance reconciliation (like this change) or an equivalent accumulation of archived changes makes their content materially inconsistent with `knowledge-base/` and `openspec/specs/*`. Prior versions SHALL be kept as historical records rather than overwritten.

#### Scenario: Knowledge base is reconciled with a batch of archived changes

- **WHEN** a documentation-governance reconciliation change updates `knowledge-base/` to reflect newly archived capabilities (e.g. a new domain, new API contracts, new architecture decisions)
- **THEN** a new version of the affected DOC-01/02/03 file(s) is produced reflecting the same content, and the previous version file remains in `docs/` unmodified
