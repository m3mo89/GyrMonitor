---
title: Business Rules
area: requirements
category: business-rules
status: approved
version: 1.0
last_updated: 2026-06-26
---

# Business Rules

## Purpose

This document centralizes the business rules of GyrMonitor. These rules should guide domain models, use cases, API behavior, validation, tests and OpenSpec proposals.

## Risk Analysis Rules

### BR-001: Risk Score Calculation After Inactivity

The system must calculate a risk score after registering a relevant inactivity event.

- **Applies To:** Activity Events, Risk Analysis
- **Related Requirements:** FRQ-005, FRQ-007
- **Related Use Cases:** UC-01, UC-02

### BR-002: Activity Events Do Not Generate Alerts by Default

Only inactivity events may generate alerts in the MVP.

- **Applies To:** Activity Events, Risk Analysis, Alerts
- **Related Requirements:** FRQ-004, FRQ-005, FRQ-010

### BR-003: Severity Must Be Derived From Risk

Alert severity must be derived from the calculated risk score or configured risk thresholds.

- **Allowed Severity Values:** `LOW`, `MEDIUM`, `HIGH`
- **Applies To:** Risk Analysis, Alerts

## Event Registration Rules

### BR-004: Duplicate Event IDs Must Not Create Duplicate Events

If an event with the same `eventId` already exists, the backend must not create a duplicate event.

- **Applies To:** Activity Events, Offline Sync
- **Related API:** `POST /events`, `POST /sync/events`

### BR-005: Capture Time Is the Real Event Time

The `capturedAt` field represents when the event happened, not when it was synchronized.

- **Applies To:** Activity Events, Offline Sync, Dashboard

### BR-006: Events Must Reference Existing Cattle

An activity event must be associated with an existing cattle record.

- **Applies To:** Activity Events, Cattle

## Alert Rules

### BR-007: Alerts Start as Pending

Newly generated alerts must start with status `PENDING`.

- **Applies To:** Alerts
- **Related Requirements:** FRQ-010

### BR-008: Alert Status Must Follow Allowed Values

Alert status must use the allowed states.

- **Allowed Values:** `PENDING`, `IN_PROGRESS`, `ATTENDED`
- **Applies To:** Alerts, Inspections

### BR-009: Attended Alerts Must Store Attendance Time

When an alert is marked as attended, the system must store `attendedAt`.

- **Applies To:** Alerts, Inspections
- **Related API:** `PATCH /alerts/{id}/status`

## Observation Rules

### BR-010: Observations Must Reference an Alert

An observation must be associated with an existing alert.

- **Applies To:** Observations, Alerts, Inspections

### BR-011: Observations Must Preserve Author and Creation Time

Observations must preserve the user who created them and the original creation time.

- **Applies To:** Observations, Users, Offline Sync

## Offline Sync Rules

### BR-012: Sync Operations Must Use Idempotency

Synchronization operations must use an `Idempotency-Key` to prevent duplicate processing during retries.

- **Applies To:** Offline Sync, API
- **Related API:** `POST /sync/events`, `POST /sync/observations`

### BR-013: Idempotency Conflicts Must Be Reported

If an idempotency key is reused with a different payload, the system must report an idempotency conflict.

- **Applies To:** Offline Sync, API Error Model
- **Error Code:** `IDEMPOTENCY_CONFLICT`

### BR-014: Partial Sync Failures Must Be Observable

If a sync batch is partially processed, the response must expose which items succeeded, duplicated or failed.

- **Applies To:** Offline Sync
- **Error Code:** `SYNC_PARTIAL_FAILURE`

## Security Rules

### BR-015: Protected Operations Require Authentication

All operations except login and health checks must require a valid JWT.

- **Applies To:** Authentication, API

### BR-016: Role Permissions Must Be Enforced

Users must only access operations allowed by their role.

- **Roles:** `ADMIN`, `FIELD_OPERATOR`, `RESEARCHER`, `SYSTEM_GENERATOR`

## Dashboard Rules

### BR-017: Dashboard Must Present Backend-Computed Metrics

The frontend must not own critical business calculations for risk, severity or alert generation.

- **Applies To:** Dashboard, Frontend, Backend

### BR-018: Dashboard Period Filters Must Preserve UTC Semantics

Date filters must be interpreted consistently with UTC storage and client-side conversion.

- **Applies To:** Dashboard, API, Frontend
