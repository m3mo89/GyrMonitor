---
title: Product Scope
module: product
version: 0.1.0
status: approved
owner: GyrMonitor Team
last_updated: 2026-06-26
---

# Product Scope

## Purpose

This document defines the scope of the GyrMonitor MVP and separates current capabilities from future evolution.

## MVP Scope

| Area | Included |
| --- | --- |
| Cattle Monitoring | Register and consult cattle records. |
| Activity Events | Register activity and inactivity events. |
| Risk Analysis | Calculate risk score and severity from inactivity data. |
| Alerts | Generate, list, view, and update alerts. |
| Observations | Record field observations related to alerts. |
| Dashboard | Show metrics, trends, active alerts, and risk ranking. |
| Offline Support | Store pending mobile and desktop operations locally. |
| Synchronization | Sync pending events and observations with idempotency. |
| API | Provide REST contracts for web, mobile, desktop and controlled event producers. |

## Out of Scope for MVP

| Area | Exclusion |
| --- | --- |
| Machine Learning | No production ML model is included in the MVP. |
| Automated Detection | Automated detection, model inference and external sensing infrastructure are not part of the MVP. |
| IoT Sensors | Physical IoT sensor integration is excluded. |
| Veterinary Diagnosis | The system does not automatically diagnose health conditions. |
| Advanced Reporting | BI-style reporting is future work. |
| High-scale Streaming | Message queues and time-series storage are future work. |

## MVP Assumption

The MVP can receive events from a simulator, manual data source, desktop client, mobile client or controlled test data. Business rules must remain independent of the event producer.

## Scope Boundaries

GyrMonitor is a decision-support platform. It helps prioritize field inspection, but it does not replace veterinary evaluation or human decision-making.

## Related Documents

- `01-product/vision.md`
- `03-requirements/functional-requirements.md`
- `04-architecture/tradeoffs.md`

## Change History

| Version | Change |
| --- | --- |
| 0.1.0 | Created product scope. |
