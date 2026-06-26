---
title: ADR-012: Test Critical Frontend Flows
area: Frontend Web
status: approved
version: 0.8.0
---

# ADR-012: Test Critical Frontend Flows

## Status

Accepted

## Context

Authentication, dashboard and alerts are critical user flows and should be regression-resistant.

## Decision

Add unit tests for utilities and critical components, plus integration tests for authentication, dashboard and alerts.

## Alternatives Considered

No tests and full E2E from day one were rejected as extremes.

## Consequences

Improves confidence without overloading the MVP. Fixtures must follow API contracts.

## Impacted Documentation

- Domain documentation when the decision affects business concepts.
- Requirements when the decision changes expected behavior.
- Architecture when the decision affects system structure.
- API or Engineering documentation when the decision affects implementation.

## Review Notes

This ADR should be revisited if the MVP scope changes, if the system introduces new runtime constraints, or if future versions require a different trade-off.
