---
title: Architecture Tradeoffs
area: architecture
version: 0.1
status: approved
owner: architecture
source_documents:
  - DOC-01_GyrMonitor_V2_Academico
  - DOC-03_GyrMonitor_Contratos_Backend_V2_Academico
---

# Architecture Tradeoffs

## Purpose

This document records the main architectural tradeoffs behind the MVP.

## Tradeoff Matrix

| Decision Area | Alternatives | Selected | Rationale |
|---|---|---|---|
| Backend architecture | Microservices, traditional monolith, modular monolith | Modular monolith | Lower operational complexity with clear domain boundaries. |
| Consistency model | Strong consistency, eventual consistency | Eventual consistency for offline clients | Intermittent connectivity requires local availability. |
| API style | REST, GraphQL, gRPC, event-driven | REST | Simple, stable and compatible with all clients. |
| Database | MariaDB, NoSQL, time-series DB | MariaDB | Relational domain and traceability needs. |
| Frontend rendering | CSR, SSR, SSG, ISR, Islands | CSR | Private interactive dashboard; SEO is not required. |
| Local storage | No cache, file storage, SQLite | SQLite | Reliable local persistence for mobile/desktop. |

## Tradeoff: Modular Monolith vs Microservices

### Decision

Use a modular monolith for MVP.

### Consequences

Positive:

- Faster implementation.
- Easier deployment.
- Simpler local development.
- Clear module boundaries can still be maintained.

Negative:

- All modules deploy together.
- Scaling individual modules independently is not available in MVP.

## Tradeoff: REST vs Event Driven

### Decision

Use REST for MVP contracts.

### Consequences

Positive:

- Easy to consume from React, MAUI and future simulators.
- Straightforward academic evaluation.
- Clear DTO contracts.

Negative:

- Very high-frequency event ingestion may require queues later.

## Tradeoff: Eventual Consistency

### Decision

Offline clients synchronize eventually.

### Consequences

Positive:

- Field users can keep working without internet.
- Data loss risk is reduced.

Negative:

- Dashboard may not immediately reflect all field data.
- Conflicts and duplicates must be handled carefully.

## Decision Rule

For MVP, prefer simplicity and correctness over premature distributed architecture.
