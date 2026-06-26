---
title: Risk Register
area: requirements
category: risk-management
status: approved
version: 1.0
last_updated: 2026-06-26
---

# Risk Register

## Purpose

This document identifies product, technical and operational risks for GyrMonitor. Each risk includes likely impact, mitigation strategy and related architectural concern.

## RISK-001: Intermittent or Missing Connectivity

### Description

The target rural environment may have unstable or unavailable internet connectivity.

### Impact

High.

### Probability

High.

### Mitigation

- Offline-first clients.
- SQLite local persistence.
- SyncQueue store-and-forward pattern.
- Idempotent sync endpoints.

### Related Requirements

- RN-04
- RN-05
- RF-18
- RF-19
- RF-20
- RF-21

## RISK-002: Duplicate Events During Retries

### Description

Network retries may send the same event more than once.

### Impact

High.

### Probability

Medium.

### Mitigation

- Use `eventId` from clients.
- Use `Idempotency-Key` for sync and critical POST operations.
- Return duplicate item results in sync responses.

### Related Requirements

- RN-06
- RF-23

## RISK-003: Large Event Volume

### Description

The MVP load estimate reaches 144,000 events per day for 100 cattle if one event per cattle per minute is generated.

### Impact

Medium to High.

### Probability

Medium.

### Mitigation

- Index events by cattle and capture time.
- Keep raw event ingestion simple for MVP.
- Consider queues and specialized storage in future versions.

### Related Requirements

- RNF-09
- RF-04
- RF-05

## RISK-004: Dashboard Query Performance

### Description

Dashboard metrics may become slow as event history grows.

### Impact

Medium.

### Probability

Medium.

### Mitigation

- Use pagination and date filters.
- Add indexes.
- Introduce cached aggregates in V2 if needed.

### Related Requirements

- RNF-08
- RF-15
- RF-16
- RF-17

## RISK-005: Business Logic Leaks into Frontend

### Description

If frontend calculates risk or alert severity, logic may become inconsistent across clients.

### Impact

High.

### Probability

Medium.

### Mitigation

- Keep risk and alert rules in backend/domain layer.
- Frontend only displays backend-computed values.

### Related Requirements

- RF-07
- RF-08
- RF-10

## RISK-006: Overengineering Too Early

### Description

Introducing microservices, event-driven infrastructure or specialized storage too early may slow the MVP.

### Impact

Medium.

### Probability

Medium.

### Mitigation

- Use modular monolith for MVP.
- Document evolution path separately.
- Defer queues and read replicas until justified.

### Related Architecture

- Clean Architecture
- Screaming Architecture
- Scalability roadmap

## RISK-007: Event Source Coupling

### Description

The MVP may be implemented in a way that makes future external event-source integration difficult.

### Impact

High.

### Probability

Medium.

### Mitigation

- Treat event generation as a source-agnostic input.
- Include `source`, `deviceId`, `capturedAt` and confidence fields.
- Keep event registration independent from producer implementation.

### Related Requirements

- RN-09
- RF-04
- RF-05

## RISK-008: Loss of Traceability

### Description

If events, alerts, observations and users are not linked properly, operational history becomes unreliable.

### Impact

High.

### Probability

Medium.

### Mitigation

- Enforce entity relationships.
- Preserve alert-to-event and observation-to-alert links.
- Store user reference for observations.

### Related Requirements

- RN-08
- RF-13

## RISK-009: Poor Documentation-Code Alignment

### Description

Implementation may drift from documentation if changes are made directly in code.

### Impact

Medium.

### Probability

Medium.

### Mitigation

- Use documentation as source of truth.
- Require OpenSpec proposals before significant changes.
- Update traceability after implementation.

## RISK-010: Security Misconfiguration

### Description

JWT handling, token storage, role checks or HTTPS configuration may be implemented incorrectly.

### Impact

High.

### Probability

Medium.

### Mitigation

- Centralize authentication.
- Enforce route guards.
- Avoid storing credentials.
- Test protected endpoints.

### Related Requirements

- RNF-04
- RNF-05
