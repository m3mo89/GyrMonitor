---
title: User Requirements
area: requirements
category: user
status: approved
version: 1.0
last_updated: 2026-06-26
---

# User Requirements

## Purpose

This document defines user-facing needs by actor. These requirements describe what each type of user expects to accomplish with GyrMonitor.

## Actors

| Actor | Description |
| --- | --- |
| Administrator | Oversees system state, cattle, alerts, metrics and operational monitoring. |
| Field Operator | Reviews pending alerts, attends cattle in the field and records observations. |
| Researcher | Reviews historical trends and risk indicators for analysis. |
| System Generator | External or internal component that registers activity and inactivity events. |

## URQ-001 / RU-01: Dashboard Overview

Administrators shall be able to consult a dashboard with the general state of the system.

### Related Modules

- Dashboard
- Alerts
- Risk Analysis
- Cattle

### Related API

- `GET /dashboard`

## URQ-002 / RU-02: Active Alerts and Severity

Administrators shall be able to consult active alerts and their severity.

### Related Modules

- Alerts
- Dashboard

### Related API

- `GET /alerts`

## URQ-003 / RU-03: Cattle Event History

Administrators shall be able to consult the historical events associated with a specific cattle record.

### Related Modules

- Cattle
- Activity Events
- Alerts
- Observations

### Related API

- `GET /cattle/{id}`
- `GET /cattle/{id}/events`

## URQ-004 / RU-04: Risk Ranking

Administrators shall be able to view cattle ranked by risk.

### Related Modules

- Risk Analysis
- Dashboard
- Cattle

### Related API

- `GET /dashboard`

## URQ-005 / RU-05: Mobile Pending Alerts

Field operators shall be able to consult pending alerts from a mobile client.

### Related Modules

- Alerts
- Mobile
- Offline Sync

### Related API

- `GET /alerts?status=PENDING`

## URQ-006 / RU-06: Field Observations

Field operators shall be able to register observations during field inspections.

### Related Modules

- Observations
- Inspections
- Alerts
- Offline Sync

### Related API

- `POST /alerts/{id}/observations`
- `POST /sync/observations`

## URQ-007 / RU-07: Attend Alerts

Field operators shall be able to mark alerts as attended.

### Related Modules

- Alerts
- Inspections

### Related API

- `PATCH /alerts/{id}/status`

## URQ-008 / RU-08: Continue Working Offline

Field operators shall be able to continue working when there is no network connectivity.

### Related Modules

- Offline Sync
- SQLite Local Model
- Mobile
- Desktop

## URQ-009 / RU-09: Historical Trends

Researchers shall be able to consult historical trends for analysis.

### Related Modules

- Dashboard
- Activity Events
- Risk Analysis
- Alerts

### Related API

- `GET /dashboard?from={date}&to={date}`

## URQ-010 / RU-10: Event Registration by Generator

The system generator shall be able to register activity and inactivity events.

### Related Modules

- Activity Events
- Risk Analysis
- Alerts

### Related API

- `POST /events`
- `POST /sync/events`
