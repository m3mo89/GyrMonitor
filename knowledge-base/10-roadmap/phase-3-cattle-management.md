---
title: Phase 3 - Cattle Management
section: 10-roadmap
status: approved
version: 0.9.0
---

# Phase 3: Cattle Management

## Goal

Implement the cattle records required by events, alerts, observations and dashboard metrics.

## Scope

- Cattle entity.
- Cattle repository.
- Cattle list endpoint.
- Cattle detail endpoint.
- Cattle history contract placeholder.
- Web cattle list/detail UI.
- Seed data for MVP testing.

## Related Documentation

- `02-domain/cattle.md`
- `05-api/cattle.md`
- `03-requirements/functional-requirements.md`

## OpenSpec Change

```text
add-cattle-management
```

## Acceptance Criteria

- Cattle records can be listed.
- Cattle details can be consulted.
- Cattle records expose fields needed by events, alerts and dashboard.
- Later modules can reference cattle by UUID.

