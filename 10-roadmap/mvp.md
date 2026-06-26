---
title: MVP Scope
section: 10-roadmap
status: approved
version: 0.9.0
---

# MVP Scope

## Purpose

The MVP validates GyrMonitor as a software platform for monitoring cattle inactivity under intermittent connectivity. It does not validate automated detection pipelines, model inference, physical sensors or specialized hardware deployment.

## In Scope

| Area | Included |
|---|---|
| Authentication | Login, JWT, roles and protected routes. |
| Cattle Management | Register and consult cattle records. |
| Activity Events | Register activity and inactivity events through manual, simulated or controlled sources. |
| Risk Analysis | Calculate risk score from inactivity event data. |
| Alerts | Generate, list, filter and attend alerts. |
| Observations | Record field observations associated with alerts. |
| Dashboard | Show totals, active alerts, average risk, high-risk cattle, ranking and trends. |
| Offline Sync | Store local operations in SQLite and synchronize using idempotent backend contracts. |
| Web Client | Dashboard and administrative interaction. |
| Mobile Client | Field workflow with offline support. |
| Desktop Client | Administrative/simulation workflow and offline support. |
| Database | MariaDB central database and SQLite local storage. |

## Out of Scope

| Area | Excluded from MVP |
|---|---|
| Automated Detection | No model training, inference, automated detection or external sensing infrastructure. |
| Hardware Deployment | No specialized hardware, external device fleet or field hardware deployment. |
| IoT Sensors | No physical sensors or telemetry hardware. |
| Veterinary Diagnosis | No automatic medical diagnosis. |
| Push Notifications | Can be considered later; not required for MVP. |
| Multi-ranch SaaS | Single deployment context for MVP. |
| Advanced Analytics | Basic historical metrics only. |

## MVP Success Criteria

The MVP is successful when:

1. Users can authenticate and access role-appropriate functionality.
2. Cattle records can be created and consulted.
3. Activity/inactivity events can be registered.
4. Risk score and alert generation work according to documented rules.
5. Field observations can be associated with alerts.
6. Dashboard metrics reflect system state.
7. Mobile and desktop clients can persist offline operations and synchronize later.
8. Idempotency prevents duplicate events during retries.

## MVP Implementation Principle

The MVP should be designed so that approved event producers can be added later without changing core business rules.

