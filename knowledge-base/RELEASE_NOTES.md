---
title: Release Notes
status: approved
version: 1.3.1
---

# GyrMonitor Docs v1.0

This release closes Phase 1: the MVP Knowledge Base.

## Scope

This documentation version describes only the GyrMonitor MVP.

The MVP includes:

- Authentication.
- Cattle Management.
- Observations.
- Activity Events.
- Alerts.
- Dashboard.
- Offline Synchronization.
- Backend, frontend, mobile, desktop and database implementation guidance.

## Scope Boundary

The MVP is limited to structured events, simulated events, manual input, offline synchronization and dashboard workflows.

Advanced automated event generation, specialized hardware deployment and research experiments are excluded from this release.

## OpenSpec Readiness

The project is ready to start manual OpenSpec proposals. Recommended first proposal:

```text
add-authentication
```

## Documentation Policy

The documentation structure is frozen for the MVP phase. Future changes should update content, not reorganize the repository, unless a reviewed architectural decision requires it.


## v1.0.1 - Final Phase 1 Cleanup

- Removed remaining MVP references to automated detection pipelines and specialized hardware implementation.
- Replaced edge/device-specific examples with simulator/client-neutral examples.
- Added `99-meta/` with master index, module catalog, traceability matrix, dependency matrix, document status and project decisions log.
- Confirmed `11-openspec/` remains guidance-only; proposals and implementations are created manually by the project owner.

## v1.1.0 - Project Standards Freeze

Status: Frozen baseline for Phase 1.

Changes:

- Added repository standards under `.github/`.
- Added issue templates and pull request template.
- Added security and support policies.
- Added CODEOWNERS.
- Added GitHub Actions placeholders for documentation checks.
- Added `.editorconfig`, `.gitattributes`, `.gitignore`, `LICENSE`, and root `CONTRIBUTING.md`.
- Confirmed the Knowledge Base remains focused on the GyrMonitor MVP.

Decision:

- Phase 1 is closed after this version.
- Further functional changes should be driven by manually authored OpenSpec proposals.

## v1.2.0 - MVP Implementation Complete

All 9 MVP roadmap phases were implemented via manually authored OpenSpec proposals (`openspec/changes/archive/`, 2026-06-29 to 2026-07-01):

- `setup-project-foundation`, `add-authentication`, `add-cattle-management`, `add-observations`, `add-activity-events`, `add-database-persistence`, `enable-backend-runtime`, `improve-backend-tests`, `add-alerts`, `add-dashboard`, `add-offline-sync`, `add-system-generator-web-message`, `extract-risk-analysis-module`, `stabilize-mvp-release`.

The backend, frontend, mobile, and desktop workspaces moved from foundation skeletons to a working MVP: authentication, cattle management, activity/inactivity events, risk-based alerts, field observations, dashboard metrics, and offline synchronization for mobile/desktop clients.

## v1.3.0 - Post-MVP: Clients, Staging, Admin, Localization

12 further changes were archived after `stabilize-mvp-release` (2026-07-02 to 2026-07-08), none of which had been reflected in the knowledge base until this reconciliation pass (`sync-docs-with-implementation`):

- `add-openapi-docs`, `dedupe-maui-client-core`, `desktop-connectivity-feedback`, `desktop-ui-polish`, `restrict-client-target-platforms`, `frontend-architecture-alignment`, `refactor-backend-architecture-cleanup`, `configure-staging-environment`, `admin-user-management`, `db-create-admin-script`, `frontend-clean-architecture-alignment`, `translate-ui-to-spanish`.

Highlights: interactive OpenAPI docs; a shared `.NET MAUI` client core for desktop/mobile; desktop restricted to Mac Catalyst/Windows and mobile to Android/iOS; a staging deployment on Railway/Vercel; ADMIN-only user management with a `db:create-admin` bootstrap script; and Spanish UI localization across frontend (i18next), desktop, and mobile (`.resx`) — see ADR-016.

## v1.3.1 - Desktop/Mobile Client Environment Selection and Logout

`configure-client-environments` (archived 2026-07-08) gives the desktop and mobile clients the same Local/Development, Staging, Production environment story the frontend already had, but resolved at runtime instead of at build time:

- A shared, testable `IApiEnvironmentService`/`ApiEnvironmentCatalog` in `GyrMonitor.Client.Core` replaces the old hardcoded `MauiProgram.ApiBaseUrl` constant.
- Debug builds default to Local/Development and show an environment picker on the login screen (Local/Development, Staging, Production); Release builds always start on, and stay on, Production.
- Once the current environment is Production — reached either way — the picker is no longer shown; there is no in-app path back to Local/Staging.
- Both clients gained an explicit logout action (previously the only way back to the login screen was an automatic session-expiry redirect), which is what makes "return to login to change environments" an actual capability.

See `docs/release/deployment-environments.md` and `knowledge-base/07-reference/configuration.md` for the updated environment matrix and configuration reference.
