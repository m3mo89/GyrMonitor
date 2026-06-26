---
title: Phase 6 - Alerts
section: 10-roadmap
status: approved
version: 0.9.0
---

# Phase 6: Alerts

## Goal

Implement alert generation and alert lifecycle management.

## Scope

- Alert entity.
- Risk score threshold evaluation.
- Severity assignment.
- Alert listing and filtering.
- Alert detail.
- Alert status update.
- Link between alert, event and cattle.

## Related Documentation

- `02-domain/alerts.md`
- `02-domain/risk-analysis.md`
- `05-api/alerts.md`

## OpenSpec Change

```text
add-alerts
```

## Acceptance Criteria

- Inactivity events above threshold generate alerts.
- Alert status starts as `PENDING`.
- Authorized users can update alert status.
- Alerts remain traceable to source events.

