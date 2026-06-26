---
title: Phase 5 - Activity Events
section: 10-roadmap
status: approved
version: 0.9.0
---

# Phase 5: Activity Events

## Goal

Implement the event registration capability that feeds risk analysis and alert generation.

## Scope

- ActivityEvent entity.
- Event registration endpoint.
- Event listing endpoint.
- Event history by cattle.
- Idempotent event creation using `eventId` and/or `Idempotency-Key`.
- Controlled simulator/manual event source for MVP.

## Important MVP Boundary

The MVP registers structured events from manual input, simulator or controlled test data.

## Related Documentation

- `02-domain/activity-events.md`
- `05-api/activity-events.md`
- `07-reference/dto-catalog.md`

## OpenSpec Change

```text
add-activity-events
```

## Acceptance Criteria

- Valid events are persisted.
- Duplicate event IDs do not create duplicate records.
- Events are associated with existing cattle.
- Events can later trigger risk analysis and alerts.

