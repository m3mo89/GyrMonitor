---
title: Product Stakeholders
module: product
version: 0.1.0
status: approved
owner: GyrMonitor Team
last_updated: 2026-06-26
---

# Product Stakeholders

## Purpose

This document identifies the users, actors, and interested parties involved in GyrMonitor.

## Primary Users

| Stakeholder | Description | Main Needs |
| --- | --- | --- |
| Administrator | User responsible for monitoring the overall system. | Dashboard, alerts, cattle records, history, and operational state. |
| Field Operator | User responsible for reviewing cattle and recording observations in the field. | Offline alert access, observation registration, alert attendance. |
| Researcher | User interested in trends, historical data, and system behavior. | Metrics, filters, history, and traceable data. |

## System Actors

| Actor | Description |
| --- | --- |
| Event Generator | Simulated, manual, desktop, mobile, or controlled test-data source that creates activity events. |
| Backend API | Central system that validates events, calculates risk, generates alerts, and stores records. |
| Mobile Client | Field-focused client that must support offline operation. |
| Desktop Client | Administrative or simulation client that can also support offline operation. |
| Web Frontend | Dashboard-oriented client for administrators and researchers. |

## Secondary Stakeholders

| Stakeholder | Interest |
| --- | --- |
| Academic Evaluators | Need a well-structured project aligned with academic project objectives. |
| Academic Director or Advisor | Needs evidence of academic alignment, technical feasibility, and implementation strategy. |
| Future Farm Personnel | May benefit from field prioritization and monitoring workflows. |

## Responsibility Boundaries

GyrMonitor provides monitoring and prioritization support. Field operators and qualified professionals remain responsible for interpreting animal condition and taking field action.

## Related Documents

- `03-requirements/user-requirements.md`
- `03-requirements/user-stories.md`
- `03-requirements/use-cases.md`

## Change History

| Version | Change |
| --- | --- |
| 0.1.0 | Created product stakeholders. |
