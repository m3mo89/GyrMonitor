---
title: ADR-009: Visualize Metrics from Backend Aggregates
area: Dashboard
status: approved
version: 0.8.0
---

# ADR-009: Visualize Metrics from Backend Aggregates

## Status

Accepted

## Context

Dashboard views must show metrics, trends and risk ranking without duplicating business logic in the browser.

## Decision

Use charts, cards and tables based on aggregated data returned by /dashboard and metrics-oriented endpoints.

## Alternatives Considered

Calculating critical metrics in frontend and using external BI tools were rejected for the MVP.

## Consequences

Keeps business rules in backend. Requires well-designed aggregation endpoints.

## Impacted Documentation

- Domain documentation when the decision affects business concepts.
- Requirements when the decision changes expected behavior.
- Architecture when the decision affects system structure.
- API or Engineering documentation when the decision affects implementation.

## Review Notes

This ADR should be revisited if the MVP scope changes, if the system introduces new runtime constraints, or if future versions require a different trade-off.
