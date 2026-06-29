# GyrMonitor Project Foundation

This repository is in Phase 1: Foundation. The goal is to prepare structure, tooling, conventions, and baseline architecture before implementing business modules.

## Source of Truth

Foundation work must stay aligned with:

- `knowledge-base/99-meta/MASTER_INDEX.md`
- `knowledge-base/00-introduction/PROJECT_STRUCTURE.md`
- `knowledge-base/06-engineering/README.md`
- `knowledge-base/07-reference/directory-map.md`
- `knowledge-base/10-roadmap/phase-1-foundation.md`
- `knowledge-base/11-openspec/README.md`

## Foundation Areas

- `backend/`: NestJS-oriented TypeScript backend skeleton.
- `frontend/`: React + TypeScript frontend skeleton.
- `mobile/`: .NET MAUI mobile setup path and placeholders.
- `desktop/`: .NET MAUI desktop setup path and placeholders.
- `database/`: MariaDB and SQLite structure guidance.

## Verification

The baseline command surface is:

```sh
npm run format:check
npm run lint
npm run test
npm run build
npm run verify
npm run ci:check
```

These commands validate the foundation scaffold and placeholders. They intentionally do not verify domain behavior because domain modules are outside Phase 1.

## Boundaries

This foundation does not implement authentication, domain rules, REST API behavior, production seed data, or completed MVP feature workflows.
