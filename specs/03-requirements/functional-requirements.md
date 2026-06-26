---
title: Functional Requirements
area: requirements
category: functional
status: approved
version: 1.0
last_updated: 2026-06-26
---

# Functional Requirements

## Purpose

This document defines the capabilities expected from the GyrMonitor MVP. Each requirement is written as a development-ready specification and linked to domain modules, use cases and API contracts.

## Cattle Monitoring

### FRQ-001 / RF-01: Register Cattle

The system shall allow cattle records to be registered.

- **Priority:** High
- **Domain:** Cattle
- **Data:** `Cattle`
- **Future API:** `POST /cattle`
- **MVP Note:** The academic contract currently emphasizes cattle listing and history. Creation may be seeded or implemented as a future administrative capability.

### FRQ-002 / RF-02: Consult Cattle

The system shall allow users to consult registered cattle.

- **Priority:** High
- **Domain:** Cattle
- **API:** `GET /cattle`
- **Actors:** Administrator, Researcher

### FRQ-003 / RF-03: Consult Cattle History

The system shall allow users to consult the history of a cattle record.

- **Priority:** High
- **Domain:** Cattle, Activity Events, Alerts, Observations
- **API:** `GET /cattle/{id}/events`
- **Related Use Case:** UC-06

## Inactivity Analysis

### FRQ-004 / RF-04: Register Activity Events

The system shall register activity events associated with cattle.

- **Priority:** High
- **Domain:** Activity Events
- **API:** `POST /events`, `POST /sync/events`
- **Business Rules:** BR-001, BR-004, BR-005

### FRQ-005 / RF-05: Register Inactivity Events

The system shall register inactivity events associated with cattle.

- **Priority:** High
- **Domain:** Activity Events, Risk Analysis
- **API:** `POST /events`, `POST /sync/events`
- **Business Rules:** BR-001, BR-002, BR-003

### FRQ-006 / RF-06: Consult Event History

The system shall allow event history to be consulted.

- **Priority:** Medium
- **Domain:** Activity Events
- **API:** `GET /events`, `GET /cattle/{id}/events`

### FRQ-007 / RF-07: Calculate Risk Score

The system shall calculate a risk score after relevant inactivity events.

- **Priority:** High
- **Domain:** Risk Analysis
- **Triggered By:** Event registration
- **Business Rules:** BR-001, BR-002, BR-003

### FRQ-008 / RF-08: Classify Risk Level

The system shall classify risk level based on the calculated risk score.

- **Priority:** High
- **Domain:** Risk Analysis, Alerts
- **Output:** `LOW`, `MEDIUM`, `HIGH`
- **Business Rules:** BR-003

### FRQ-009 / RF-09: Maintain Historical Indicators

The system shall maintain historical indicators that can be used by the dashboard.

- **Priority:** Medium
- **Domain:** Dashboard, Risk Analysis, Activity Events
- **API:** `GET /dashboard`

## Alerts

### FRQ-010 / RF-10: Generate Alerts

The system shall generate alerts whenever inactivity analysis determines that attention is required.

- **Priority:** High
- **Domain:** Alerts, Risk Analysis
- **Triggered By:** `POST /events`, `POST /sync/events`
- **Business Rules:** BR-002, BR-003, BR-006, BR-007

### FRQ-011 / RF-11: Consult Alerts

The system shall allow users to consult alerts.

- **Priority:** High
- **Domain:** Alerts
- **API:** `GET /alerts`, `GET /alerts/{id}`
- **Actors:** Administrator, Field Operator, Researcher

### FRQ-012 / RF-12: Modify Alert Status

The system shall allow authorized users to modify the status of an alert.

- **Priority:** High
- **Domain:** Alerts, Inspections
- **API:** `PATCH /alerts/{id}/status`
- **Business Rules:** BR-008, BR-009

## Inspections and Observations

### FRQ-013 / RF-13: Register Observations

The system shall allow field observations to be registered and associated with alerts.

- **Priority:** High
- **Domain:** Observations, Inspections
- **API:** `POST /alerts/{id}/observations`, `POST /sync/observations`
- **Business Rules:** BR-010, BR-011

### FRQ-014 / RF-14: Consult Observations

The system shall allow observations to be consulted as part of alert and cattle traceability.

- **Priority:** Medium
- **Domain:** Observations, Alerts
- **Future API:** `GET /alerts/{id}/observations`

## Dashboard

### FRQ-015 / RF-15: Show General Metrics

The system shall show general dashboard metrics.

- **Priority:** High
- **Domain:** Dashboard
- **API:** `GET /dashboard`
- **Metrics:** total cattle, active alerts, average risk score, high risk cattle, events today, pending sync count

### FRQ-016 / RF-16: Show Historical Trends

The system shall show historical trends for analysis.

- **Priority:** Medium
- **Domain:** Dashboard
- **API:** `GET /dashboard?from={date}&to={date}`

### FRQ-017 / RF-17: Show Risk Ranking

The system shall show a ranked list of cattle by risk.

- **Priority:** High
- **Domain:** Dashboard, Risk Analysis
- **API:** `GET /dashboard`

## Offline Sync

### FRQ-018 / RF-18: Persist Information Locally

Mobile and desktop clients shall persist information locally when connectivity is unavailable.

- **Priority:** High
- **Domain:** Offline Sync
- **Data:** SQLite local model

### FRQ-019 / RF-19: Maintain Synchronization Queue

Mobile and desktop clients shall maintain a synchronization queue for pending operations.

- **Priority:** High
- **Domain:** Offline Sync
- **Data:** `SyncQueue`

### FRQ-020 / RF-20: Synchronize Pending Events

The system shall synchronize pending activity events.

- **Priority:** High
- **Domain:** Offline Sync, Activity Events
- **API:** `POST /sync/events`
- **Business Rules:** BR-004, BR-005, BR-012

### FRQ-021 / RF-21: Synchronize Pending Observations

The system shall synchronize pending observations.

- **Priority:** High
- **Domain:** Offline Sync, Observations
- **API:** `POST /sync/observations`
- **Business Rules:** BR-010, BR-011, BR-012

### FRQ-022 / RF-22: Detect Synchronization Conflicts

The system shall detect synchronization conflicts.

- **Priority:** Medium
- **Domain:** Offline Sync
- **API:** Sync endpoints and error model
- **Business Rules:** BR-013

### FRQ-023 / RF-23: Apply Idempotency

The system shall apply idempotency to critical POST and synchronization operations.

- **Priority:** High
- **Domain:** Offline Sync, API
- **API:** `POST /events`, `POST /sync/events`, `POST /sync/observations`
- **Business Rules:** BR-004, BR-012, BR-013
