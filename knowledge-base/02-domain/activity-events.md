---
title: Activity Events
section: domain
status: approved
version: 1.0
---

# Activity Events

## Purpose

An Activity Event represents a structured activity or inactivity record associated with a cattle record.

## Responsibilities

- Capture whether an animal was active or inactive.
- Store inactivity duration when applicable.
- Preserve the capture timestamp.
- Provide input for risk analysis.
- Preserve the source label for auditability.

## Entity Fields

| Field | Type | Description |
| --- | --- | --- |
| id | UUID | Event identifier. |
| cattleId | UUID | Related cattle record. |
| eventType | enum | `ACTIVITY` or `INACTIVITY`. |
| inactiveMinutes | integer | Duration of inactivity. |
| confidence | decimal | Optional confidence value for simulated or generated sources. |
| capturedAt | datetime | Time when the event was captured. |
| source | string | Source such as `MANUAL_ENTRY`, `DESKTOP_SIMULATOR`, `MOBILE_CLIENT`, `DESKTOP_CLIENT` or `CONTROLLED_TEST_DATA`. |
| createdAt | datetime | Time when the backend stored the event. |

## Business Rules

- Every event must belong to an existing cattle record.
- `capturedAt` represents the real capture time, not the synchronization time.
- Duplicate event IDs must not create duplicate records.
- Only inactivity events participate in inactivity-risk evaluation.
- Event source must be recorded for auditability, but business rules must not depend on a specific source implementation.

## Related Modules

- Cattle Management.
- Risk Analysis.
- Alerts.
- Dashboard.
- Offline Sync.

## MVP Boundary

The MVP registers structured events. It does not implement external detection pipelines or specialized capture infrastructure.
