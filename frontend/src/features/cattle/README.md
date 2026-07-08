# Cattle Feature Boundary

Read-oriented Phase 3 cattle list and detail workflows.

This feature follows `knowledge-base/10-roadmap/phase-3-cattle-management.md`, `knowledge-base/02-domain/cattle.md`, and `knowledge-base/05-api/cattle.md`. It intentionally consumes cattle list/detail APIs and reserves a history placeholder for later activity-event work.

Manual cattle create/update/delete workflows are intentionally outside this phase.

```text
domain/          Cattle, activity-event history and pagination types
application/     Cattle list/detail/history query hooks
infrastructure/  Cattle HTTP API adapter
presentation/    List and detail pages
```
