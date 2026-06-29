---
title: Backend Overview
section: 05-engineering/backend
technology: NestJS + TypeScript
version: 0.6.0
status: approved
---

# Backend Overview

The backend is the central application boundary for GyrMonitor. It exposes REST APIs, authenticates clients, executes use cases, applies business rules, persists data in MariaDB and coordinates synchronization from offline clients.

## Responsibilities

- Authenticate users and system generators using JWT.
- Expose REST endpoints defined in `05-api/`.
- Implement domain use cases for cattle, activity events, risk analysis, alerts, observations and synchronization.
- Calculate risk scores after inactivity events.
- Generate alerts when business rules require attention.
- Enforce idempotency for retry-prone operations.
- Persist central data in MariaDB.
- Produce logs for errors, synchronization attempts and relevant operational events.

## Recommended Stack

| Concern | Decision |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | NestJS |
| API style | REST |
| Database | MariaDB |
| ORM | Prisma or TypeORM; Prisma preferred for MVP simplicity |
| Authentication | JWT Bearer Token |
| Validation | DTO validation with class-validator or schema-based validation |
| Testing | Unit tests for use cases, integration tests for controllers and repositories |

## Module Boundaries

```text
src/
  authentication/
  cattle-monitoring/
  activity-events/
  risk-analysis/
  alerts/
  inspections/
  dashboard/
  offline-sync/
  shared/
```

Each business module should expose only the minimum surface needed by other modules. Cross-module calls should happen through application services or ports, not by importing infrastructure details.

## Related Documents

- `02-domain/domain-model.md`
- `03-requirements/functional-requirements.md`
- `04-architecture/clean-architecture.md`
- `05-api/overview.md`
