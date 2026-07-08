# GyrMonitor Project Foundation

The repository foundation (structure, tooling, conventions, and baseline architecture) is implemented, and the MVP business modules described in `knowledge-base/00-introduction/ROADMAP.md` have since been built on top of it — see `openspec/changes/archive/` for the full implementation history.

## Source of Truth

Ongoing work must stay aligned with:

- `knowledge-base/99-meta/MASTER_INDEX.md`
- `knowledge-base/00-introduction/PROJECT_STRUCTURE.md`
- `knowledge-base/06-engineering/README.md`
- `knowledge-base/07-reference/directory-map.md`
- `knowledge-base/10-roadmap/`
- `knowledge-base/11-openspec/README.md`

## Areas

- `backend/`: NestJS backend — authentication, cattle monitoring, activity events, alerts, inactivity analysis, observations (inspections), offline sync, dashboard, and admin user management.
- `frontend/`: React + TypeScript frontend with per-feature Clean Architecture layering (auth, user-management, cattle, alerts, dashboard implemented; events and metrics deferred) and Spanish i18n via i18next.
- `mobile/`: .NET MAUI field application (Android/iOS) with offline-capable observation capture and sync.
- `desktop/`: .NET MAUI desktop application (Mac Catalyst/Windows) sharing client core logic with mobile via `shared/GyrMonitor.Client.Core`.
- `database/`: MariaDB (server) and SQLite (mobile/desktop local storage) schema, migrations, and seeds.

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

These commands validate both the foundation scaffold and the implemented domain behavior across workspaces.
