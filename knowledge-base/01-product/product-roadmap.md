---
title: Product Roadmap
section: product
status: approved
version: 1.0
---

# Product Roadmap

## MVP Scope

GyrMonitor MVP will deliver a complete software workflow for cattle monitoring under intermittent connectivity.

## Roadmap

1. Foundation and project structure.
2. Authentication and authorization.
3. Cattle management.
4. Observations.
5. Activity events.
6. Alerts.
7. Dashboard.
8. Offline synchronization.
9. Testing and release.

## MVP Exclusions

The MVP excludes advanced automated event generation, specialized hardware deployment, external sensing infrastructure and research experiments.

## Success Condition

The MVP is successful when a user can manage cattle, register events, generate and attend alerts, record observations, view dashboard metrics and synchronize offline data reliably.

## Post-MVP

All 9 MVP roadmap phases are implemented. Post-MVP work has added: admin-only user management (create/list/disable/reactivate/reset-password, plus a command-line bootstrap script), Spanish UI localization across frontend/desktop/mobile, staging deployment configuration, and desktop/mobile client refinements (connectivity feedback, UI polish, restricting desktop to Mac Catalyst/Windows and mobile to Android/iOS). See `knowledge-base/00-introduction/ROADMAP.md` and `openspec/changes/archive/` for the full history.
