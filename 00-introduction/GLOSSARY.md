---
title: GyrMonitor Glossary
module: project
version: 0.1.0
status: approved
owner: GyrMonitor Team
last_updated: 2026-06-26
---

# Glossary

This glossary defines the canonical vocabulary for GyrMonitor. Use these terms consistently in documentation, code, API contracts, database models, and OpenSpec proposals.

## ActivityEvent

A record that represents an activity or inactivity event associated with a cattle entity.

Examples:

- `ACTIVITY`
- `INACTIVITY`

An ActivityEvent may be generated manually, by a simulator, by a mobile client, by a desktop client, or by controlled test data.

## Alert

An operational notification generated when a cattle entity presents a condition that requires attention, such as prolonged inactivity above a configured threshold.

Common states:

- `PENDING`
- `IN_PROGRESS`
- `ATTENDED`

## Alert Severity

A classification that describes the urgency or importance of an alert.

Common values:

- `LOW`
- `MEDIUM`
- `HIGH`

## Cattle

A registered bovine animal monitored by GyrMonitor.

A Cattle entity may have:

- ID.
- Tag number.
- Breed.
- Sex.
- Birth date.
- Status.
- Related ActivityEvents.
- Related Alerts.

## Eventual Consistency

A consistency model where local data and server data may temporarily differ but converge after synchronization.

This is required because GyrMonitor must support intermittent connectivity.

## FieldOperator

A user responsible for field operations such as checking alerts, attending cattle, and registering observations.

Equivalent Spanish role in academic context: encargado de campo.

## Idempotency

A property that allows the same operation to be safely retried without creating duplicate records.

GyrMonitor uses the `Idempotency-Key` header and stable entity IDs to prevent duplicate events or observations during sync retries.

## Idempotency-Key

An HTTP header sent by clients for sync and critical POST operations.

Example:

```http
Idempotency-Key: sync-events-MOBILE-001-20260620-001
```

## Inactivity Analysis

The module responsible for analyzing inactivity events, calculating RiskScore, and supporting alert generation.

## LocalAlert

A local SQLite representation of an alert used by mobile or desktop clients for offline work.

## Observation

A field note registered by a user during inspection or alert follow-up.

An Observation must be linked to an Alert and a User.

## Offline First

An architectural approach where clients can continue working without connectivity by storing data locally and synchronizing later.

In GyrMonitor, mobile and desktop clients use SQLite and a SyncQueue.

## PendingEvent

A local event stored in SQLite and waiting to be synchronized with the backend.

## PendingObservation

A local observation stored in SQLite and waiting to be synchronized with the backend.

## REST API

The HTTP-based API exposed by the backend for web, mobile, and desktop clients.

Base path:

```text
/api/v1
```

## RiskScore

A numeric value that represents the calculated risk associated with cattle inactivity.

The backend owns the calculation. Frontend clients should display the value but not calculate it.

## Screaming Architecture

An architecture style where the project structure communicates the business domain rather than the framework.

Example modules:

- `cattle-monitoring`
- `inactivity-analysis`
- `alerts`
- `inspections`
- `dashboard`
- `authentication`

## SyncLog

A server-side record that stores synchronization attempts, entity references, status, client/device information, and timestamps.

## SyncQueue

A local queue used by mobile and desktop clients to store operations that must be synchronized when connectivity returns.

Common fields:

- Entity type.
- Entity ID.
- Operation.
- Retry count.
- Status.
- Created at.

## SYSTEM_GENERATOR

A role used by trusted event-producing clients, such as a simulator, desktop client, or controlled test data loader.

## User Roles

Supported roles:

| Role | Purpose |
| --- | --- |
| ADMIN | Full operational and administrative access. |
| FIELD_OPERATOR | Field alert handling and observation registration. |
| RESEARCHER | Dashboard, trends, and historical analysis. |
| SYSTEM_GENERATOR | Event generation from trusted clients. |

## Change History

| Version | Date | Description |
| --- | --- | --- |
| 0.1.0 | 2026-06-26 | Initial glossary. |
