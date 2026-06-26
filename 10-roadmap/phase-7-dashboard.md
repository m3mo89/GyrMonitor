---
title: Phase 7 - Dashboard
section: 10-roadmap
status: approved
version: 0.9.0
---

# Phase 7: Dashboard

## Goal

Provide operational visibility through web and desktop dashboards.

## Scope

- Dashboard metrics endpoint.
- Total cattle.
- Active alerts.
- Average risk score.
- High-risk cattle count.
- Events today.
- Pending sync count.
- Risk ranking.
- Trend data.
- React dashboard page.

## Related Documentation

- `05-api/dashboard.md`
- `07-reference/dto-catalog.md`
- `06-engineering/frontend/`

## OpenSpec Change

```text
add-dashboard
```

## Acceptance Criteria

- Dashboard loads key metrics.
- Dashboard handles loading, empty and error states.
- Dashboard uses backend-calculated metrics.
- Typical dashboard queries respond within the MVP performance target.

