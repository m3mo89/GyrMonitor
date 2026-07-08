---
title: Traceability Matrix
area: requirements
category: traceability
status: approved
version: 1.0
last_updated: 2026-06-26
---

# Traceability Matrix

## Purpose

This document maps requirements to domain modules, use cases, API contracts, data entities and expected UI surfaces. It is intended to support implementation planning, testing, OpenSpec proposals and academic evaluation.

## Business Requirement Traceability

| Business Requirement | Domain Modules | Use Cases | API | Notes |
| --- | --- | --- | --- | --- |
| RN-01 Early identification | Activity Events, Risk Analysis, Alerts | UC-01, UC-02, UC-03 | `POST /events`, `POST /sync/events` | Core MVP capability. |
| RN-02 Prioritize inspections | Risk Analysis, Alerts, Inspections, Dashboard | UC-02, UC-03, UC-04, UC-06 | `GET /alerts`, `GET /dashboard` | Drives operational decision-making. |
| RN-03 Centralize history | Cattle, Events, Alerts, Observations | UC-01, UC-04, UC-06 | `GET /cattle/{id}/events` | Supports traceability and research. |
| RN-04 Intermittent connectivity | Offline Sync, Events, Observations | UC-04, UC-05 | `POST /sync/events`, `POST /sync/observations` | Core rural constraint. |
| RN-05 Automatic synchronization | Offline Sync | UC-05 | `/sync/*` | Store-and-forward pattern. |
| RN-06 Avoid duplication | Offline Sync, API | UC-01, UC-05 | `Idempotency-Key`, `eventId` | Prevents corrupt metrics and repeated alerts. |
| RN-07 Multiplatform access | Web, Mobile, Desktop, API | UC-04, UC-06 | All protected endpoints | Different clients for different contexts. |
| RN-08 Traceability | Events, Alerts, Observations, Users | UC-01, UC-03, UC-04 | Events, alerts and observations endpoints | Audit and follow-up. |
| RN-09 event source independence | Events, Risk Analysis, API | UC-01 | `POST /events` | Producer-independent event ingestion. |
| RN-10 Historical indicators | Dashboard, Events, Alerts | UC-06 | `GET /dashboard` | Research and monitoring. |

## Functional Requirement Traceability

| Functional Requirement | Domain | Use Case | API | Data Entity | UI Surface |
| --- | --- | --- | --- | --- | --- |
| RF-01 Register cattle | Cattle | Future | Future `POST /cattle` | Cattle | Admin Cattle Form |
| RF-02 Consult cattle | Cattle | UC-07 | `GET /cattle` | Cattle | Cattle List |
| RF-03 Cattle history | Cattle, Events | UC-07 | `GET /cattle/{id}/events` | Cattle, ActivityEvent | Cattle Detail |
| RF-04 Register activity | Activity Events | UC-01 | `POST /events` | ActivityEvent | Simulator / Manual / Test Data |
| RF-05 Register inactivity | Activity Events | UC-01 | `POST /events` | ActivityEvent | Simulator / Manual / Test Data |
| RF-06 Event history | Activity Events | UC-07 | `GET /events` | ActivityEvent | Event Timeline |
| RF-07 Calculate risk | Risk Analysis | UC-02 | Internal | RiskScore | Dashboard / Alert Detail |
| RF-08 Classify risk | Risk Analysis | UC-02 | Internal | Severity | Badges / Ranking |
| RF-09 Historical indicators | Dashboard | UC-06 | `GET /dashboard` | Aggregates | Dashboard |
| RF-10 Generate alerts | Alerts | UC-03 | Triggered by `POST /events` | Alert | Alerts List |
| RF-11 Consult alerts | Alerts | UC-08 | `GET /alerts` | Alert | Alerts List |
| RF-12 Modify alert status | Alerts | UC-04 | `PATCH /alerts/{id}/status` | Alert | Alert Detail |
| RF-13 Register observations | Observations | UC-04 | `POST /alerts/{id}/observations` | Observation | Observation Form |
| RF-14 Consult observations | Observations | UC-04 | Future `GET /alerts/{id}/observations` | Observation | Alert Detail |
| RF-15 General metrics | Dashboard | UC-06 | `GET /dashboard` | Aggregates | Dashboard Cards |
| RF-16 Historical trends | Dashboard | UC-06 | `GET /dashboard` | Aggregates | Charts |
| RF-17 Risk ranking | Dashboard | UC-06 | `GET /dashboard` | Aggregates | Ranking Table |
| RF-18 Local persistence | Offline Sync | UC-04, UC-05 | Local | SQLite tables | Mobile/Desktop |
| RF-19 Sync queue | Offline Sync | UC-05 | Local | SyncQueue | Sync Status |
| RF-20 Sync events | Offline Sync | UC-05 | `POST /sync/events` | PendingEvent | Sync Engine |
| RF-21 Sync observations | Offline Sync | UC-04 | `POST /sync/observations` | PendingObservation | Sync Engine |
| RF-22 Detect conflicts | Offline Sync | UC-05 | `/sync/*` | SyncLog | Sync Status |
| RF-23 Idempotency | Offline Sync, API | UC-01, UC-05 | `Idempotency-Key` | SyncLog | Technical |

## Quality Attribute Traceability

| Quality Attribute | Architecture Concern | Validation Method |
| --- | --- | --- |
| RNF-01 Clean Architecture | Layer boundaries | Dependency review and unit tests. |
| RNF-02 Screaming Architecture | Module organization | Folder structure review. |
| RNF-03 SOLID | Internal code quality | Code review and tests. |
| RNF-04 JWT | Security | Authentication and authorization tests. |
| RNF-05 HTTPS | Transport security | Deployment configuration review. |
| RNF-06 Offline operation | Availability | Offline functional tests. |
| RNF-07 Eventual sync | Consistency | Sync integration tests. |
| RNF-08 Dashboard < 3s | Performance | API and frontend performance tests. |
| RNF-09 100 cattle MVP | Scalability | Seeded dataset tests. |
| RNF-10 Logs and errors | Observability | Error model and sync logs review. |

## OpenSpec Usage

When creating an OpenSpec change, reference this document to identify affected areas.

Example:

```text
Change: add-alerts
References:
- 02-domain/alerts.md
- 03-requirements/functional-requirements.md#frq-010--rf-10-generate-alerts
- 03-requirements/business-rules.md#br-007-alerts-start-as-pending
- 03-requirements/traceability.md
```
