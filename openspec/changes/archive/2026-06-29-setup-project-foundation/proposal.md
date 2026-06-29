## Why

GyrMonitor is entering Phase 1, where the repository needs a small executable foundation before business modules can be implemented safely. This change prepares the project structure, skeleton applications, configuration approach, and verification baseline described by `knowledge-base/10-roadmap/phase-1-foundation.md`.

The Knowledge Base remains the source of truth. This proposal references the approved structure and engineering guidance instead of restating long requirements.

## What Changes

- Add the repository foundation described by `knowledge-base/00-introduction/PROJECT_STRUCTURE.md` and `knowledge-base/07-reference/directory-map.md`.
- Add a minimal NestJS backend skeleton aligned with `knowledge-base/06-engineering/backend/overview.md`.
- Add a minimal React + TypeScript frontend skeleton aligned with `knowledge-base/06-engineering/frontend/overview.md`.
- Add .NET MAUI mobile and desktop skeleton placeholders or documented setup paths aligned with `knowledge-base/06-engineering/mobile/overview.md` and `knowledge-base/06-engineering/desktop/overview.md`.
- Add MariaDB and SQLite database folder guidance aligned with `knowledge-base/06-engineering/database/overview.md`.
- Add non-secret environment configuration strategy, linting, formatting, testing, and CI/test command placeholders.
- Exclude domain logic and authentication implementation.

## Capabilities

### New Capabilities

- `project-foundation`: Repository layout, app skeletons, database structure, environment strategy, and baseline quality commands needed before domain implementation.

### Modified Capabilities

None.

## Impact

- Affects root-level project structure under `backend/`, `frontend/`, `mobile/`, `desktop/`, and database-related folders.
- Introduces or updates baseline project metadata, scripts, environment examples, test placeholders, and documentation links.
- References `knowledge-base/99-meta/MASTER_INDEX.md`, `knowledge-base/06-engineering/README.md`, and `knowledge-base/11-openspec/README.md` as governance and workflow context.
- Does not introduce business logic, authentication behavior, API behavior, domain rules, production secrets, or completed MVP feature implementations.
