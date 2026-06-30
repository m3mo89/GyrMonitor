# Cattle Monitoring Boundary

Read-oriented Phase 3 cattle reference capability.

This module follows `knowledge-base/10-roadmap/phase-3-cattle-management.md` and the domain/API contracts in `knowledge-base/02-domain/cattle.md` and `knowledge-base/05-api/cattle.md`.

## MVP Seed Data

The current backend foundation does not include a database adapter, so cattle records are served by `LocalCattleRepository` with stable MVP seed UUIDs and unique `tagNumber` values. The seed supports list/detail verification and later module fixtures.

Manual cattle create/update/delete workflows are intentionally outside this phase.
