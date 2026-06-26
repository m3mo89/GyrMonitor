---
title: Business Problem
module: product
version: 0.1.0
status: approved
owner: GyrMonitor Team
last_updated: 2026-06-26
---

# Business Problem

## Problem Statement

Cattle monitoring in rural environments often depends on manual visual inspection. This can delay the identification of animals with prolonged inactivity, especially when staff availability is limited, terrain is large, and connectivity is intermittent.

## Main Problems

| ID | Problem | Impact |
| --- | --- | --- |
| BP-01 | Manual inspection dependency. | Delayed detection and inconsistent monitoring. |
| BP-02 | Difficulty prioritizing animals. | Field staff may not know which cattle require attention first. |
| BP-03 | Intermittent connectivity. | Data may be lost or delayed if clients cannot work offline. |
| BP-04 | Lack of traceability. | It is difficult to connect events, alerts, observations, and field response. |
| BP-05 | Lack of centralized history. | Trend analysis and research use become harder. |

## Product Response

GyrMonitor addresses these problems by:

- Registering activity and inactivity events.
- Calculating risk indicators.
- Generating alerts based on inactivity.
- Supporting observations and alert attendance.
- Allowing offline data capture in mobile and desktop clients.
- Synchronizing pending data when connectivity returns.
- Providing dashboards and historical views.

## Non-Goals

GyrMonitor does not attempt to replace veterinary diagnosis, physical inspection, or animal welfare expertise. It supports prioritization and traceability.

## Related Documents

- `01-product/scope.md`
- `02-domain/risk-analysis.md`
- `02-domain/alerts.md`
- `03-requirements/business-requirements.md`

## Change History

| Version | Change |
| --- | --- |
| 0.1.0 | Created business problem document. |
