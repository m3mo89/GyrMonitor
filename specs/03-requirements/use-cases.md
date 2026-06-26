---
title: Use Cases
area: requirements
category: use-cases
status: approved
version: 1.0
last_updated: 2026-06-26
---

# Use Cases

## Purpose

This document defines the primary system use cases for the MVP. Use cases connect actors, requirements, domain modules and API behavior.

## UC-01: Register Activity Event

### Primary Actor

System Generator.

### Goal

Register an activity or inactivity event associated with a cattle record.

### Preconditions

- The cattle record exists.
- The actor is authenticated or authorized as a system generator.
- The payload includes required event information.

### Main Flow

1. The generator sends an event registration request.
2. The backend validates the payload.
3. The backend verifies cattle existence.
4. The backend checks idempotency or duplicate event ID.
5. The backend persists the event.
6. If the event is an inactivity event, the backend triggers risk calculation.
7. If risk exceeds threshold, the backend generates an alert.
8. The backend returns the event result.

### Postconditions

- The event is stored.
- A risk result exists when applicable.
- An alert may be generated.

### Related API

- `POST /events`
- `POST /sync/events`

## UC-02: Calculate Risk

### Primary Actor

Backend system.

### Goal

Calculate risk after a relevant inactivity event.

### Preconditions

- An inactivity event has been registered.
- Required event fields are available.

### Main Flow

1. The backend receives the event context.
2. The risk calculation rule is applied.
3. A risk score is produced.
4. Severity is classified.
5. The result is made available to alert generation and dashboard metrics.

### Postconditions

- A risk score exists.
- Severity is classified.

## UC-03: Generate Alert

### Primary Actor

Backend system.

### Goal

Create an alert when risk indicates that field attention is required.

### Preconditions

- Risk score has been calculated.
- Risk exceeds the configured alert threshold.

### Main Flow

1. The alert engine receives the risk result.
2. The system creates an alert.
3. The alert is associated with cattle and originating event.
4. The alert receives severity, risk score and status.
5. The alert is persisted.

### Postconditions

- A pending alert exists.

## UC-04: Register Observation

### Primary Actor

Field Operator.

### Goal

Record field inspection observations associated with an alert.

### Preconditions

- The alert exists.
- The user is authenticated.

### Main Flow - Online

1. The field operator writes an observation.
2. The client sends the observation to the backend.
3. The backend validates the payload.
4. The backend associates the observation with the alert and user.
5. The backend persists the observation.
6. The backend returns the created observation.

### Main Flow - Offline

1. The field operator writes an observation.
2. The client persists the observation locally.
3. The client adds a pending operation to `SyncQueue`.
4. When connectivity returns, the client synchronizes the observation.

### Postconditions

- The observation is persisted remotely or queued locally.

### Related API

- `POST /alerts/{id}/observations`
- `POST /sync/observations`

## UC-05: Synchronize Events

### Primary Actor

Mobile or Desktop Client.

### Goal

Synchronize events captured while offline.

### Preconditions

- The client has pending event records in SQLite.
- Connectivity is available.
- The client has authorization.

### Main Flow

1. The client reads pending events from local storage.
2. The client sends a sync batch with `Idempotency-Key`.
3. The backend validates the batch.
4. The backend processes each item.
5. The backend detects duplicates and failures.
6. The backend returns a per-item result.
7. The client updates local sync status.

### Postconditions

- Successfully processed events are marked as synchronized.
- Failed events remain pending or failed for retry.

### Related API

- `POST /sync/events`

## UC-06: Consult Dashboard

### Primary Actor

Administrator or Researcher.

### Goal

Obtain system metrics, alerts, ranking and trends.

### Preconditions

- The user is authenticated.
- The user has a role allowed to consult dashboard data.

### Main Flow

1. The user opens the dashboard.
2. The frontend requests dashboard metrics.
3. The backend aggregates or retrieves required metrics.
4. The frontend displays cards, ranking and trends.

### Postconditions

- Dashboard data is visible to the user.

### Related API

- `GET /dashboard`
