---
title: Screaming Architecture
area: architecture
version: 0.1
status: approved
owner: architecture
source_documents:
  - DOC-01_GyrMonitor_V2_Academico
  - DOC-03_GyrMonitor_Contratos_Backend_V2_Academico
---

# Screaming Architecture

## Purpose

This document defines the domain-first organization strategy for GyrMonitor.

## Principle

The project structure should communicate the business domain before the framework.

A new developer should see the project and immediately understand that it is about cattle monitoring, inactivity analysis, alerts, inspections, dashboard and synchronization.

## Backend Modules

```text
src/
  authentication/
  user-management/
  cattle-monitoring/
  activity-events/
  risk-analysis/
  alerts/
  inspections/
  dashboard/
  offline-sync/
  shared/
```

## Frontend Features

```text
src/
  app/
  features/
    auth/
    user-management/
    dashboard/
    cattle/
    events/       # placeholder, not yet implemented
    alerts/
    metrics/      # placeholder, not yet implemented
  shared/
```

Each implemented feature (`auth`, `user-management`, `dashboard`, `cattle`, `alerts`) follows Clean Architecture layering internally — see `04-architecture/clean-architecture.md`.

## Domain Modules

| Module | Reason to Exist |
| --- | --- |
| User Management | ADMIN-only account administration (create, list, disable/reactivate, reset password). |
| Cattle Monitoring | Manage and consult cattle records. |
| Activity Events | Register activity and inactivity events. |
| Risk Analysis | Calculate risk score and severity. |
| Alerts | Prioritize field attention. |
| Inspections | Support field follow-up. |
| Observations | Record human inspection notes. |
| Dashboard | Present metrics and trends. |
| Offline Sync | Preserve availability during connectivity loss. |

## Anti-Patterns to Avoid

Avoid organizing core code only by technical type:

```text
controllers/
services/
repositories/
dtos/
```

This structure hides the domain and makes features harder to reason about as the project grows.

## Preferred Rule

Group by feature first, then by technical layer inside the feature.

```text
alerts/
  domain/
  application/
  infrastructure/
  presentation/
```

## Impact on AI-Assisted Development

Domain-first organization helps AI tools implement focused changes because context is localized by business capability.
