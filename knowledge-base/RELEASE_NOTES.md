---
title: Release Notes
status: approved
version: 1.1.0
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
