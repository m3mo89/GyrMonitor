## Context

GyrMonitor currently has an approved Knowledge Base and roadmap, but the executable application foundations are not yet present. Phase 1 needs a reviewable foundation for the NestJS backend, React + TypeScript frontend, .NET MAUI mobile and desktop paths, central MariaDB guidance, local SQLite guidance, environment configuration, and quality commands.

The source of truth is `knowledge-base/`. The most relevant documents for this change are:

- `knowledge-base/99-meta/MASTER_INDEX.md`
- `knowledge-base/10-roadmap/phase-1-foundation.md`
- `knowledge-base/00-introduction/PROJECT_STRUCTURE.md`
- `knowledge-base/06-engineering/README.md`
- `knowledge-base/06-engineering/backend/overview.md`
- `knowledge-base/06-engineering/frontend/overview.md`
- `knowledge-base/06-engineering/mobile/overview.md`
- `knowledge-base/06-engineering/desktop/overview.md`
- `knowledge-base/06-engineering/database/overview.md`
- `knowledge-base/07-reference/directory-map.md`
- `knowledge-base/11-openspec/README.md`

This change must not implement MVP business modules yet; it prepares the codebase so later OpenSpec changes can add authentication, cattle management, activity events, alerts, dashboard, and offline sync incrementally.

## Goals / Non-Goals

**Goals:**

- Establish root-level application folders that match the documented repository map.
- Add minimal backend, frontend, mobile, desktop, and database scaffolds that can be built or validated independently.
- Allow mobile and desktop to be represented by documented setup paths if the local environment is not ready for full .NET MAUI project generation.
- Provide non-secret environment examples and typed configuration entry points for later implementation.
- Add baseline linting, formatting, build, test, and CI/test command placeholders so the repository has repeatable verification.
- Preserve valid documentation links and make future feature work traceable to the knowledge base.

**Non-Goals:**

- Implement authentication, cattle management, activity events, alerts, dashboards, offline synchronization behavior, or other MVP business logic.
- Add production infrastructure, deployment automation, secret management, or live database migrations.
- Decide every future package, UI library, ORM detail, or charting dependency beyond the minimal foundation needed for Phase 1.
- Implement computer vision, machine learning, edge computing, IoT, or automatic activity detection.

## Decisions

1. Use separate root folders for each runtime.

   The foundation will keep `backend/`, `frontend/`, `mobile/`, `desktop/`, and database-related structure as separate top-level areas. This matches `knowledge-base/00-introduction/PROJECT_STRUCTURE.md` and `knowledge-base/07-reference/directory-map.md`, keeps technology-specific tooling isolated, and avoids forcing a monorepo package manager decision before the project needs one.

   Alternative considered: create one unified workspace that manages every runtime. This was deferred because JavaScript and .NET tooling have different lifecycle expectations, and the current goal is a clear baseline rather than workspace-level optimization.

2. Scaffold runtime-specific skeletons without domain behavior.

   The backend will expose the NestJS application boundary and module folders, the frontend will expose the Vite/React application boundary, and mobile/desktop will expose .NET MAUI setup paths or placeholders. Business feature folders may exist as empty or placeholder boundaries, but they must not contain domain rules, authentication implementation, or completed workflows.

   Alternative considered: implement the first feature while scaffolding. This was rejected because Phase 1's definition of done explicitly excludes domain logic.

3. Treat configuration as a contract, not a secret store.

   Each runtime will receive example configuration and startup validation placeholders based on the Knowledge Base configuration guidance. Production secrets must remain uncommitted, and implementation must leave clear extension points for secure values later.

   Alternative considered: commit complete local secrets for immediate convenience. This was rejected because it conflicts with the configuration principles and would make later environment separation harder.

4. Add quality commands even when some are placeholders.

   The foundation will include repeatable command surfaces for build, lint, format, test, and CI/test placeholders. Commands may be minimal while skeletons are empty, but they must make the expected verification workflow visible for later changes.

   Alternative considered: wait until each feature chooses its own commands. This was rejected because later work needs a common definition of "the project builds successfully."

5. Keep database structure split by central and local persistence.

   MariaDB-related folders will represent the central system of record, while SQLite-related folders will represent mobile and desktop offline storage preparation. Initial seed strategy can be represented through placeholders and documentation, without creating domain seed data.

   Alternative considered: use one persistence folder for both database types. This was rejected because the architecture distinguishes authoritative backend persistence from local offline persistence.

## Risks / Trade-offs

- [Risk] Skeleton folders may become stale if later changes choose different framework details. -> Mitigation: keep placeholders small and align names with approved Knowledge Base documents.
- [Risk] Placeholder commands can create false confidence if they do not exercise meaningful code. -> Mitigation: make them explicit baseline commands and expand them as soon as runtime code appears.
- [Risk] Creating module directories before implementation can imply completed behavior. -> Mitigation: document and verify that no domain logic, authentication behavior, API behavior, or workflows are introduced in this change.
- [Risk] Multi-runtime scaffolding can create setup friction. -> Mitigation: keep each runtime independently valid and document required commands clearly.

## Migration Plan

This is an initial foundation change with no existing application runtime to migrate. Implementation can be added directly under the approved root folders. Rollback consists of removing the generated scaffold files and restoring any root metadata changed by this foundation.

## Open Questions

- Which package manager should be the long-term default for the JavaScript projects if the repository later adopts workspace-level orchestration?
- Should the backend use Prisma or TypeORM when database implementation begins? The knowledge base prefers Prisma for MVP simplicity, but this foundation does not need to finalize ORM code.
- Should mobile and desktop share a .NET solution immediately, or remain separate until shared client code is introduced?
