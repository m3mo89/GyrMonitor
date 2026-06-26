---
title: Quality Attributes
area: requirements
category: non-functional
status: approved
version: 1.0
last_updated: 2026-06-26
---

# Quality Attributes

## Purpose

This document translates the non-functional requirements into quality attributes that guide architecture, implementation and testing.

## QAR-001 / RNF-01: Maintainability through Clean Architecture

The backend shall be implemented using Clean Architecture principles.

### Rationale

Business rules must remain independent from framework, database and transport details.

### Architectural Implications

- Use cases should live in the application layer.
- Entities and value objects should live in the domain layer.
- Controllers should adapt HTTP requests to use cases.
- Infrastructure should implement ports defined by the application layer.

### Validation

- Domain code does not import NestJS modules.
- Use cases depend on repository interfaces, not ORM implementations.

## QAR-002 / RNF-02: Understandability through Screaming Architecture

The project structure shall communicate business capabilities before technical frameworks.

### Rationale

A developer should identify the system domain by reading the folder names.

### Architectural Implications

- Modules are organized around capabilities such as `alerts`, `activity-events`, `cattle`, `dashboard`, `offline-sync`.
- Shared technical utilities must not dominate the structure.

## QAR-003 / RNF-03: Internal Quality through SOLID

The implementation shall apply SOLID principles.

### Rationale

The system must evolve without collapsing into tightly coupled services.

### Validation

- Use cases have a single responsibility.
- Risk rules can be extended without rewriting controllers.
- Repositories can be mocked in tests.

## QAR-004 / RNF-04: Security through JWT Authentication

The backend shall protect private resources using JWT-based authentication.

### Validation

- `POST /auth/login` is public.
- Protected endpoints require `Authorization: Bearer <token>`.
- Role restrictions are enforced.

## QAR-005 / RNF-05: Secure Communication through HTTPS

Production communication shall use HTTPS.

### Validation

- Production base URL uses HTTPS.
- Tokens are not transmitted over insecure channels in production.

## QAR-006 / RNF-06: Availability through Offline Operation

Mobile and desktop clients shall support offline operation.

### Validation

- Field operations can be persisted locally.
- Pending operations survive application restart.
- Synchronization resumes when connectivity returns.

## QAR-007 / RNF-07: Consistency through Eventual Synchronization

The system shall use eventual consistency between local clients and the central backend.

### Validation

- Local records have synchronization status.
- Server responses include synchronization results.
- Duplicate retries do not create duplicate server records.

## QAR-008 / RNF-08: Dashboard Performance

The dashboard shall respond in less than 3 seconds for typical MVP queries.

### Architectural Implications

- Dashboard metrics should be pre-aggregated or efficiently queried when necessary.
- Frontend should use client-side cache for repeated dashboard views.
- API queries should support date filters.

### Validation

- Performance tests cover the expected MVP dataset.
- Frontend shows loading states and cached data when appropriate.

## QAR-009 / RNF-09: MVP Scalability

The backend shall support at least 100 cattle in the MVP.

### Expected Load

- 100 cattle.
- 1 event per cattle per minute.
- 144,000 events per day.
- 4,320,000 events per month.

### Architectural Implications

- Event persistence must be indexed by cattle and capture time.
- Dashboard queries should avoid full table scans.
- Future versions may require queues or specialized time-series storage.

## QAR-010 / RNF-10: Observability

The system shall register synchronization logs and relevant errors.

### Validation

- Sync operations produce status records or logs.
- API errors include request metadata.
- Frontend handles and reports API failures consistently.

## Additional Quality Attributes

### Reliability

The system should tolerate transient network failures without losing local operations.

### Testability

Use cases should be testable without real databases, HTTP servers or UI frameworks.

### Evolvability

The system should allow future integration with message queues, specialized storage and additional approved event sources.
